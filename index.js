'use strict'

const path = require('path')
const url = require('url')
const { readdir } = require('fs').promises
const pkgUp = require('pkg-up')
const semver = require('semver')

const isTsNode = (Symbol.for('ts-node.register.instance') in process) || !!process.env.TS_NODE_DEV
const isJestEnvironment = process.env.JEST_WORKER_ID !== undefined
const isSWCRegister = process._preload_modules && process._preload_modules.includes('@swc/register')
const isSWCNode = typeof process.env._ === 'string' && process.env._.includes('.bin/swc-node')
const isTsm = process._preload_modules && process._preload_modules.includes('tsm')
const typescriptSupport = isTsNode || isJestEnvironment || isSWCRegister || isSWCNode || isTsm
const moduleSupport = semver.satisfies(process.version, '>= 14 || >= 12.17.0 < 13.0.0')
const routeParamPattern = /\/_/ig
const routeMixedParamPattern = /__/g

const defaults = {
  scriptPattern: /((^.?|\.[^d]|[^.]d|[^.][^d])\.ts|\.js|\.cjs|\.mjs)$/i,
  indexPattern: /^index(\.ts|\.js|\.cjs|\.mjs)$/i,
  autoHooksPattern: /^[_.]?auto_?hooks(\.ts|\.js|\.cjs|\.mjs)$/i,
  dirNameRoutePrefix: true,
  encapsulate: true
}

const fastifyAutoload = async function autoload (fastify, options) {
  const packageType = await getPackageType(options.dir)
  const opts = { ...defaults, packageType, ...options }
  const pluginTree = await findPlugins(opts.dir, opts)
  const pluginsMeta = {}
  const hooksMeta = {}

  const pluginArray = [].concat.apply([], Object.values(pluginTree).map(o => o.plugins))
  const hookArray = [].concat.apply([], Object.values(pluginTree).map(o => o.hooks))

  await Promise.all(pluginArray.map(({ file, type, prefix }) => {
    return loadPlugin(file, type, prefix, opts)
      .then((plugin) => {
        if (plugin) {
          // create route parameters from prefixed folders
          if (options.routeParams) {
            plugin.options.prefix = plugin.options.prefix
              ? replaceRouteParamPattern(plugin.options.prefix)
              : plugin.options.prefix
          }
          pluginsMeta[plugin.name] = plugin
        }
      })
      .catch((err) => {
        throw enrichError(err)
      })
  }))

  function replaceRouteParamPattern (pattern) {
    const isRegularRouteParam = pattern.match(routeParamPattern)
    const isMixedRouteParam = pattern.match(routeMixedParamPattern)

    if (isMixedRouteParam) {
      return pattern.replace(routeMixedParamPattern, ':')
    } else if (isRegularRouteParam) {
      return pattern.replace(routeParamPattern, '/:')
    } else {
      return pattern
    }
  }

  await Promise.all(hookArray.map((h) => {
    if (hooksMeta[h.file]) return null // hook plugin already loaded, skip this instance
    return loadHook(h, opts)
      .then((hookPlugin) => {
        if (hookPlugin) {
          hooksMeta[h.file] = hookPlugin
        }
      })
      .catch((err) => {
        throw enrichError(err)
      })
  }))

  const metas = Object.values(pluginsMeta)
  for (const prefix in pluginTree) {
    const hookFiles = pluginTree[prefix].hooks
    const pluginFiles = pluginTree[prefix].plugins
    if (hookFiles.length === 0) {
      registerAllPlugins(fastify, pluginFiles)
    } else {
      const composedPlugin = async function (app) {
        // find hook functions for this prefix
        for (const hookFile of hookFiles) {
          const hookPlugin = hooksMeta[hookFile.file]
          // encapsulate hooks at plugin level
          if (hookPlugin) app.register(hookPlugin)
        }
        registerAllPlugins(app, pluginFiles)
      }
      fastify.register(composedPlugin)
    }
  }

  function registerAllPlugins (app, pluginFiles) {
    for (const pluginFile of pluginFiles) {
      // find plugins for this prefix, based on filename stored in registerPlugins()
      const plugin = metas.find((i) => i.filename === pluginFile.file)
      // register plugins at fastify level
      if (plugin) registerPlugin(app, plugin, pluginsMeta)
    }
  }
}

async function getPackageType (cwd) {
  const nearestPackage = await pkgUp({ cwd })
  if (nearestPackage) {
    return require(nearestPackage).type
  }
}

const typescriptPattern = /\.ts$/i
const modulePattern = /\.mjs$/i
const commonjsPattern = /\.cjs$/i
function getScriptType (fname, packageType) {
  return (modulePattern.test(fname) ? 'module' : commonjsPattern.test(fname) ? 'commonjs' : typescriptPattern.test(fname) ? 'typescript' : packageType) || 'commonjs'
}

// eslint-disable-next-line default-param-last
async function findPlugins (dir, options, hookedAccumulator = {}, prefix, depth = 0, hooks = []) {
  const { indexPattern, ignorePattern, scriptPattern, dirNameRoutePrefix, maxDepth, autoHooksPattern } = options
  const list = await readdir(dir, { withFileTypes: true })
  let currentHooks = []

  // check to see if hooks or plugins have been added to this prefix, initialize if not
  if (!hookedAccumulator[prefix || '/']) hookedAccumulator[prefix || '/'] = { hooks: [], plugins: [] }

  if (options.autoHooks) {
    // Hooks were passed in, create new array specific to this plugin item
    if (hooks && hooks.length > 0) {
      for (const hook of hooks) {
        currentHooks.push(hook)
      }
    }

    // Contains autohooks file?
    const autoHooks = list.find((dirent) => autoHooksPattern.test(dirent.name))
    if (autoHooks) {
      const autoHooksFile = path.join(dir, autoHooks.name)
      const autoHooksType = getScriptType(autoHooksFile, options.packageType)

      // Overwrite current hooks?
      if (options.overwriteHooks && currentHooks.length > 0) {
        currentHooks = []
      }

      // Add hook to current chain
      currentHooks.push({ file: autoHooksFile, type: autoHooksType })
    }

    hookedAccumulator[prefix || '/'].hooks = currentHooks
  }

  // Contains index file?
  const indexDirent = list.find((dirent) => indexPattern.test(dirent.name))
  if (indexDirent) {
    const file = path.join(dir, indexDirent.name)
    const type = getScriptType(file, options.packageType)
    if (type === 'typescript' && !typescriptSupport) {
      throw new Error(`fastify-autoload cannot import hooks plugin at '${file}'. To fix this error compile TypeScript to JavaScript or use 'ts-node' to run your app.`)
    }
    if (type === 'module' && !moduleSupport) {
      throw new Error(`fastify-autoload cannot import hooks plugin at '${file}'. Your version of node does not support ES modules. To fix this error upgrade to Node 14 or use CommonJS syntax.`)
    }

    hookedAccumulator[prefix || '/'].plugins.push({ file, type, prefix })
    const hasDirectory = list.find((dirent) => dirent.isDirectory())

    if (!hasDirectory) {
      return hookedAccumulator
    }
  }

  // Contains package.json but no index.js file?
  const packageDirent = list.find((dirent) => dirent.name === 'package.json')
  if (packageDirent && !indexDirent) {
    throw new Error(`fastify-autoload cannot import plugin at '${dir}'. To fix this error rename the main entry file to 'index.js' (or .cjs, .mjs, .ts).`)
  }

  // Otherwise treat each script file as a plugin
  const directoryPromises = []
  for (const dirent of list) {
    if (ignorePattern && dirent.name.match(ignorePattern)) {
      continue
    }

    const atMaxDepth = Number.isFinite(maxDepth) && maxDepth <= depth
    const file = path.join(dir, dirent.name)
    if (dirent.isDirectory() && !atMaxDepth) {
      let prefixBreadCrumb = (prefix ? `${prefix}/` : '/')
      if (dirNameRoutePrefix === true) {
        prefixBreadCrumb += dirent.name
      } else if (typeof dirNameRoutePrefix === 'function') {
        const prefixReplacer = dirNameRoutePrefix(dir, dirent.name)
        if (prefixReplacer) {
          prefixBreadCrumb += prefixReplacer
        }
      }

      // Pass hooks forward to next level
      if (options.autoHooks && options.cascadeHooks) {
        directoryPromises.push(findPlugins(file, options, hookedAccumulator, prefixBreadCrumb, depth + 1, currentHooks))
      } else {
        directoryPromises.push(findPlugins(file, options, hookedAccumulator, prefixBreadCrumb, depth + 1))
      }

      continue
    } else if (indexDirent) {
      // An index.js file is present in the directory so we ignore the others modules (but not the subdirectories)
      continue
    }

    if (dirent.isFile() && scriptPattern.test(dirent.name)) {
      const type = getScriptType(file, options.packageType)
      if (type === 'typescript' && !typescriptSupport) {
        throw new Error(`fastify-autoload cannot import plugin at '${file}'. To fix this error compile TypeScript to JavaScript or use 'ts-node' to run your app.`)
      }
      if (type === 'module' && !moduleSupport) {
        throw new Error(`fastify-autoload cannot import plugin at '${file}'. Your version of node does not support ES modules. To fix this error upgrade to Node 14 or use CommonJS syntax.`)
      }

      // Don't place hook in plugin queue
      if (!autoHooksPattern.test(dirent.name)) {
        hookedAccumulator[prefix || '/'].plugins.push({ file, type, prefix })
      }
    }
  }
  await Promise.all(directoryPromises)

  return hookedAccumulator
}

async function loadPlugin (file, type, directoryPrefix, options) {
  const { options: overrideConfig, forceESM, encapsulate } = options
  let content
  if (forceESM || type === 'module') {
    content = await import(url.pathToFileURL(file).href)
  } else {
    content = require(file)
  }

  const plugin = wrapRoutes(content.default || content)
  const pluginConfig = (content.default && content.default.autoConfig) || content.autoConfig || {}
  const pluginOptions = Object.assign({}, pluginConfig, overrideConfig)
  const pluginMeta = plugin[Symbol.for('plugin-meta')] || {}

  if (!encapsulate) {
    plugin[Symbol.for('skip-override')] = true
  }

  if (plugin.autoload === false || content.autoload === false) {
    return
  }

  // Reset to support overriding autoConfig for library plugins
  if (plugin.autoConfig !== undefined) {
    plugin.autoConfig = undefined
  }

  pluginOptions.prefix = (pluginOptions.prefix && pluginOptions.prefix.endsWith('/')) ? pluginOptions.prefix.slice(0, -1) : pluginOptions.prefix
  const prefixOverride = plugin.prefixOverride !== undefined ? plugin.prefixOverride : content.prefixOverride !== undefined ? content.prefixOverride : undefined
  const prefix = (plugin.autoPrefix !== undefined ? plugin.autoPrefix : content.autoPrefix !== undefined ? content.autoPrefix : undefined) || directoryPrefix
  if (prefixOverride !== undefined) {
    pluginOptions.prefix = prefixOverride
  } else if (prefix) {
    pluginOptions.prefix = (pluginOptions.prefix || '') + prefix.replace(/\/+/g, '/')
  }

  return {
    plugin,
    filename: file,
    name: pluginMeta.name || file,
    dependencies: pluginMeta.dependencies,
    options: pluginOptions,
    registered: false
  }
}

function registerPlugin (fastify, meta, allPlugins, parentPlugins = {}) {
  const { plugin, name, options, dependencies = [] } = meta

  if (parentPlugins[name]) {
    throw new Error('Cyclic dependency')
  }

  if (meta.registered) {
    return
  }

  parentPlugins[name] = true
  for (const name of dependencies) {
    if (allPlugins[name]) {
      // we create a shallow copy of parentPlugins so we can load once the ones that are
      // on two different dependency chains
      registerPlugin(fastify, allPlugins[name], allPlugins, { ...parentPlugins })
    }
  }

  fastify.register(plugin, options)

  meta.registered = true
}

function wrapRoutes (content) {
  if (content &&
    Object.prototype.toString.call(content) === '[object Object]' &&
    Object.prototype.hasOwnProperty.call(content, 'method')) {
    return async function (fastify, opts) {
      fastify.route(content)
    }
  }
  return content
}

async function loadHook (hook, options) {
  if (!hook) return null
  let hookContent
  if (options.forceESM || hook.type === 'module') {
    hookContent = await import(url.pathToFileURL(hook.file).href)
  } else {
    hookContent = require(hook.file)
  }

  hookContent = hookContent.default || hookContent

  if (
    Object.prototype.toString.call(hookContent) === '[object AsyncFunction]' ||
    Object.prototype.toString.call(hookContent) === '[object Function]'
  ) {
    hookContent[Symbol.for('skip-override')] = true
  }

  return hookContent
}

function enrichError (err) {
  // Hack SyntaxError message so that we provide
  // the line number to the user, otherwise they
  // will be left in the cold.
  if (err instanceof SyntaxError) {
    err.message += ' at ' + err.stack.split('\n')[0]
  }
  return err
}

// do not create a new context, do not encapsulate
// same as fastify-plugin
fastifyAutoload[Symbol.for('skip-override')] = true

module.exports = fastifyAutoload
module.exports.fastifyAutoload = fastifyAutoload
module.exports.default = fastifyAutoload
