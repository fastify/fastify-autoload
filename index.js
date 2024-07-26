'use strict'

const { promises: { readdir, readFile } } = require('node:fs')
const { join, relative, sep } = require('node:path')
const { pathToFileURL } = require('node:url')
const runtime = require('./runtime')

const routeParamPattern = /\/_/gu
const routeMixedParamPattern = /__/gu

const defaults = {
  scriptPattern: /(?:(?:^.?|\.[^d]|[^.]d|[^.][^d])\.ts|\.js|\.cjs|\.mjs|\.cts|\.mts)$/iu,
  indexPattern: /^index(?:\.ts|\.js|\.cjs|\.mjs|\.cts|\.mts)$/iu,
  autoHooksPattern: /^[_.]?auto_?hooks(?:\.ts|\.js|\.cjs|\.mjs|\.cts|\.mts)$/iu,
  dirNameRoutePrefix: true,
  encapsulate: true
}

const fastifyAutoload = async function autoload (fastify, options) {
  const packageType = await getPackageType(options.dir)
  const opts = { ...defaults, packageType, ...options }
  const pluginTree = await findPlugins(opts.dir, { opts })

  await loadPlugins()

  async function loadPlugins () {
    for (const key in pluginTree) {
      const node = {
        ...pluginTree[key],
        pluginsMeta: {},
        hooksMeta: {}
      }

      await Promise.all(node.plugins.map(({ file, type, prefix }) => {
        return loadPlugin({ file, type, directoryPrefix: prefix, options: opts, log: fastify.log })
          .then((plugin) => {
            if (plugin) {
              // create route parameters from prefixed folders
              if (options.routeParams) {
                plugin.options.prefix = plugin.options.prefix
                  ? replaceRouteParamPattern(plugin.options.prefix)
                  : plugin.options.prefix
              }
              node.pluginsMeta[plugin.name] = plugin
            }
          })
          .catch((err) => {
            throw enrichError(err)
          })
      }))

      await Promise.all(node.hooks.map((h) => {
        return loadHook(h, opts)
          .then((hookPlugin) => {
            node.hooksMeta[h.file] = hookPlugin
          })
          .catch((err) => {
            throw enrichError(err)
          })
      }))

      registerNode(node)
    }
  }

  function registerNode (node) {
    if (node.hooks.length === 0) {
      registerAllPlugins(fastify, node)
    } else {
      const composedPlugin = async function (app) {
        // find hook functions for this prefix
        for (const hookFile of node.hooks) {
          const hookPlugin = node.hooksMeta[hookFile.file]
          // encapsulate hooks at plugin level
          app.register(hookPlugin)
        }

        registerAllPlugins(app, node)
      }
      fastify.register(composedPlugin)
    }
  }

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

  function registerAllPlugins (app, node) {
    const metas = Object.values(node.pluginsMeta)
    for (const pluginFile of node.plugins) {
      // find plugins for this prefix, based on filename stored in registerPlugins()
      const plugin = metas.find((i) => i.filename === pluginFile.file)
      // register plugins at fastify level
      if (plugin) registerPlugin(app, plugin, node.pluginsMeta)
    }
  }
}

async function getPackageType (cwd) {
  const directories = cwd.split(sep)

  /* c8 ignore start */
  // required for paths that begin with the sep, such as linux root
  // ignore because OS specific evaluation
  directories[0] = directories[0] !== '' ? directories[0] : sep
  /* c8 ignore stop */
  while (directories.length > 0) {
    const filePath = join(...directories, 'package.json')

    const fileContents = await readFile(filePath, 'utf-8')
      .catch(() => null)

    if (fileContents) {
      return JSON.parse(fileContents).type
    }

    directories.pop()
  }
}

async function findPlugins (dir, options) {
  const { opts, hookedAccumulator = {}, prefix, depth = 0, hooks = [] } = options
  const list = await readdir(dir, { withFileTypes: true })

  // check to see if hooks or plugins have been added to this prefix, initialize if not
  if (!hookedAccumulator[prefix || '/']) {
    hookedAccumulator[prefix || '/'] = { hooks: [], plugins: [] }
  }

  const currentHooks = getCurrentHooks()

  // Contains index file?
  const indexDirent = list.find((dirent) => opts.indexPattern.test(dirent.name))
  if (indexDirent) {
    const file = join(dir, indexDirent.name)
    const { language, type } = getScriptType(file, opts.packageType)
    if (language === 'typescript' && !runtime.supportTypeScript) {
      throw new Error(`@fastify/autoload cannot import hooks plugin at '${file}'. To fix this error compile TypeScript to JavaScript or use 'ts-node' to run your app.`)
    }

    accumulatePlugin({ file, type })
    const hasDirectory = list.find((dirent) => dirent.isDirectory())

    if (!hasDirectory) {
      return hookedAccumulator
    }
  }

  // Contains package.json but no index.js file?
  const packageDirent = list.find((dirent) => dirent.name === 'package.json')
  if (packageDirent && !indexDirent) {
    throw new Error(`@fastify/autoload cannot import plugin at '${dir}'. To fix this error rename the main entry file to 'index.js' (or .cjs, .mjs, .ts).`)
  }

  // Otherwise treat each script file as a plugin
  const directoryPromises = []
  for (const dirent of list) {
    if (opts.ignorePattern && dirent.name.match(opts.ignorePattern)) {
      continue
    }

    const atMaxDepth = Number.isFinite(opts.maxDepth) && opts.maxDepth <= depth
    const file = join(dir, dirent.name)
    if (dirent.isDirectory() && !atMaxDepth) {
      let prefixBreadCrumb = (prefix ? `${prefix}/` : '/')
      if (opts.dirNameRoutePrefix === true) {
        prefixBreadCrumb += dirent.name
      } else if (typeof opts.dirNameRoutePrefix === 'function') {
        const prefixReplacer = opts.dirNameRoutePrefix(dir, dirent.name)
        if (prefixReplacer) {
          prefixBreadCrumb += prefixReplacer
        }
      }

      // Pass hooks forward to next level
      if (opts.autoHooks && opts.cascadeHooks) {
        directoryPromises.push(findPlugins(file, { opts, hookedAccumulator, prefix: prefixBreadCrumb, depth: depth + 1, hooks: currentHooks }))
      } else {
        directoryPromises.push(findPlugins(file, { opts, hookedAccumulator, prefix: prefixBreadCrumb, depth: depth + 1 }))
      }

      continue
    } else if (indexDirent) {
      // An index.js file is present in the directory so we ignore the others modules (but not the subdirectories)
      continue
    }

    if (dirent.isFile() && opts.scriptPattern.test(dirent.name)) {
      const { language, type } = getScriptType(file, opts.packageType)
      if (language === 'typescript' && !runtime.supportTypeScript) {
        throw new Error(`@fastify/autoload cannot import plugin at '${file}'. To fix this error compile TypeScript to JavaScript or use 'ts-node' to run your app.`)
      }

      // Don't place hook in plugin queue
      if (!opts.autoHooksPattern.test(dirent.name)) {
        accumulatePlugin({ file, type })
      }
    }
  }

  await Promise.all(directoryPromises)

  return hookedAccumulator

  function getCurrentHooks () {
    let currentHooks = []

    if (opts.autoHooks) {
      // Hooks were passed in, create new array specific to this plugin item
      if (hooks && hooks.length > 0) {
        for (const hook of hooks) {
          currentHooks.push(hook)
        }
      }

      // Contains autohooks file?
      const autoHooks = list.find((dirent) => opts.autoHooksPattern.test(dirent.name))
      if (autoHooks) {
        const autoHooksFile = join(dir, autoHooks.name)
        const { type: autoHooksType } = getScriptType(autoHooksFile, opts.packageType)

        // Overwrite current hooks?
        if (opts.overwriteHooks && currentHooks.length > 0) {
          currentHooks = []
        }

        // Add hook to current chain
        currentHooks.push({ file: autoHooksFile, type: autoHooksType })
      }

      hookedAccumulator[prefix || '/'].hooks = currentHooks
    }

    return currentHooks
  }

  function accumulatePlugin ({ file, type }) {
    // Replace backward slash to forward slash for consistent behavior between windows and posix.
    const filePath = '/' + relative(opts.dir, file).replace(/\\/gu, '/')

    if (opts.matchFilter && !filterPath(filePath, opts.matchFilter)) {
      return
    }

    if (opts.ignoreFilter && filterPath(filePath, opts.ignoreFilter)) {
      return
    }

    hookedAccumulator[prefix || '/'].plugins.push({ file, type, prefix })
  }
}

async function loadPlugin ({ file, type, directoryPrefix, options, log }) {
  const { options: overrideConfig, forceESM, encapsulate } = options
  let content
  if (forceESM || type === 'module' || runtime.forceESM) {
    content = await import(pathToFileURL(file).href)
  } else {
    content = require(file)
  }

  if (isPluginOrModule(content) === false) {
    // We must have something that resembles a Fastify plugin function, or that
    // can be converted into one, that can eventually be passed to `avvio`. If
    // it is anything else, skip automatic loading of this item.
    log.debug({ file }, 'skipping autoloading of file because it does not export a Fastify plugin compatible shape')
    return
  }

  const plugin = wrapRoutes(content.default || content)
  const pluginConfig = (content.default && content.default.autoConfig) || content.autoConfig || {}
  let pluginOptions
  if (typeof pluginConfig === 'function') {
    pluginOptions = function (fastify) {
      return { ...pluginConfig(fastify), ...overrideConfig }
    }

    pluginOptions.prefix = overrideConfig.prefix ?? pluginConfig.prefix
  } else {
    pluginOptions = { ...pluginConfig, ...overrideConfig }
  }

  const pluginMeta = plugin[Symbol.for('plugin-meta')] || {}

  if (!encapsulate) {
    plugin[Symbol.for('skip-override')] = true
  }

  if (plugin.autoload === false || content.autoload === false) {
    log.debug({ file }, 'skipping autoload due to `autoload: false` being set')
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
    pluginOptions.prefix = (pluginOptions.prefix || '') + prefix.replace(/\/+/gu, '/')
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

async function loadHook (hook, options) {
  let hookContent
  if (options.forceESM || hook.type === 'module' || runtime.forceESM) {
    hookContent = await import(pathToFileURL(hook.file).href)
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

/**
 * Used to determine if the contents of a required autoloaded file matches
 * the shape of a Fastify route configuration object.
 *
 * @param {*} input The data to check.
 *
 * @returns {boolean} True if the data represents a route configuration object.
 * False otherwise.
 */
function isRouteObject (input) {
  if (input &&
    Object.prototype.toString.call(input) === '[object Object]' &&
    Object.prototype.hasOwnProperty.call(input, 'method')) {
    return true
  }
  return false
}

const pluginOrModulePattern = /\[object (?:AsyncFunction|Function|Module)\]/u
/**
 * Used to determine if the contents of a required autoloaded file is a valid
 * plugin or route configuration object. In the case of a route configuration
 * object, it will later be wrapped into a plugin.
 *
 * @param {*} input The data to check.
 *
 * @returns {boolean} True if the object can be used by the autoload system by
 * eventually passing it into `avvio`. False otherwise.
 */
function isPluginOrModule (input) {
  let result = false

  const inputType = Object.prototype.toString.call(input)
  if (pluginOrModulePattern.test(inputType) === true) {
    result = true
  } else if (Object.prototype.hasOwnProperty.call(input, 'default')) {
    result = isPluginOrModule(input.default)
  } else {
    result = isRouteObject(input)
  }

  return result
}

function wrapRoutes (content) {
  if (isRouteObject(content) === true) {
    return async function (fastify, opts) {
      fastify.route(content)
    }
  }
  return content
}

function filterPath (path, filter) {
  if (typeof filter === 'string') {
    return path.includes(filter)
  }

  if (filter instanceof RegExp) {
    return filter.test(path)
  }

  return filter(path)
}

const typescriptPattern = /\.(ts|mts|cts)$/iu
const modulePattern = /\.(mjs|mts)$/iu
const commonjsPattern = /\.(cjs|cts)$/iu
function getScriptType (fname, packageType) {
  return {
    language: typescriptPattern.test(fname) ? 'typescript' : 'javascript',
    type: determineModuleType(fname, packageType)
  }
}

function determineModuleType (fname, defaultType) {
  if (modulePattern.test(fname)) {
    return 'module'
  } else if (commonjsPattern.test(fname)) {
    return 'commonjs'
  }

  return defaultType || 'commonjs'
}

function enrichError (err) {
  // Hack SyntaxError message so that we provide
  // the line number to the user, otherwise they
  // will be left in the cold.
  if (err instanceof SyntaxError) {
    err.message += ' at ' + err.stack.split('\n', 1)[0]
  }

  return err
}

// do not create a new context, do not encapsulate
// same as fastify-plugin
fastifyAutoload[Symbol.for('skip-override')] = true

module.exports = fastifyAutoload
module.exports.fastifyAutoload = fastifyAutoload
module.exports.default = fastifyAutoload
