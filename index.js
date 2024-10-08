'use strict'

const { readFile } = require('node:fs/promises')
const { join, sep } = require('node:path')
const findPlugins = require('./lib/find-plugins')
const runtime = require('./lib/runtime')
const { pathToFileURL } = require('node:url')

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

  await loadPlugins({ pluginTree, options, opts, fastify })
}

async function loadPlugins ({ pluginTree, options, opts, fastify }) {
  const nodes = []
  const pluginsMeta = {}
  for (const key in pluginTree) {
    const node = {
      ...pluginTree[key],
      pluginsMeta,
      hooksMeta: {}
    }
    nodes.push(node)

    await Promise.all(node.plugins.map(({ file, type, prefix }) => {
      return loadPlugin({ file, type, directoryPrefix: prefix, options: opts, log: fastify.log })
        .then((plugin) => {
          if (plugin) {
            // create route parameters from prefixed folders
            if (options.routeParams && plugin.options.prefix) {
              plugin.options.prefix = replaceRouteParamPattern(plugin.options.prefix)
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
  }

  for (const node of nodes) {
    registerNode(node, fastify)
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
  const pluginOptions = loadPluginOptions(content, overrideConfig)
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

  handlePrefixConfig({ plugin, pluginOptions, content, directoryPrefix })

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

  const type = Object.prototype.toString.call(hookContent)
  if (type === '[object AsyncFunction]' || type === '[object Function]') {
    hookContent[Symbol.for('skip-override')] = true
  }

  return hookContent
}

function registerNode (node, fastify) {
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

function registerAllPlugins (app, node) {
  const metas = Object.values(node.pluginsMeta)
  for (const pluginFile of node.plugins) {
    // find plugins for this prefix, based on filename stored in registerPlugins()
    const plugin = metas.find((i) => i.filename === pluginFile.file)
    // register plugins at fastify level
    if (plugin) registerPlugin(app, plugin, node.pluginsMeta)
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

function loadPluginOptions (content, overrideConfig) {
  const pluginConfig = (content.default?.autoConfig) || content.autoConfig || {}
  if (typeof pluginConfig === 'function') {
    const pluginOptions = (fastify) => ({ ...pluginConfig(fastify), ...overrideConfig })
    pluginOptions.prefix = overrideConfig.prefix ?? pluginConfig.prefix

    return pluginOptions
  }

  return { ...pluginConfig, ...overrideConfig }
}

function handlePrefixConfig ({ plugin, pluginOptions, content, directoryPrefix }) {
  if (pluginOptions.prefix?.endsWith('/')) {
    pluginOptions.prefix = pluginOptions.prefix.slice(0, -1)
  }

  let prefix
  if (plugin.autoPrefix !== undefined) {
    prefix = plugin.autoPrefix
  } else if (content.autoPrefix !== undefined) {
    prefix = content.autoPrefix
  } else {
    prefix = directoryPrefix
  }

  const prefixOverride = plugin.prefixOverride ?? content.prefixOverride
  if (prefixOverride !== undefined) {
    pluginOptions.prefix = prefixOverride
  } else if (prefix) {
    pluginOptions.prefix = (pluginOptions.prefix || '') + prefix.replace(/\/+/gu, '/')
  }
}

const routeParamPattern = /\/_/gu
const routeMixedParamPattern = /__/gu
function replaceRouteParamPattern (pattern) {
  if (pattern.match(routeMixedParamPattern)) {
    return pattern.replace(routeMixedParamPattern, ':')
  } else if (pattern.match(routeParamPattern)) {
    return pattern.replace(routeParamPattern, '/:')
  }

  return pattern
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
  return !!(input &&
      Object.prototype.toString.call(input) === '[object Object]' &&
      Object.hasOwn(input, 'method'))
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
  } else if (Object.hasOwn(input, 'default')) {
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

function enrichError (err) {
  // Hack SyntaxError message so that we provide
  // the line number to the user, otherwise they
  // will be left in the cold.
  if (err instanceof SyntaxError) {
    err.message += ' at ' + err.stack.split('\n', 1)[0]
  }

  return err
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

// do not create a new context, do not encapsulate
// same as fastify-plugin
fastifyAutoload[Symbol.for('skip-override')] = true

module.exports = fastifyAutoload
module.exports.fastifyAutoload = fastifyAutoload
module.exports.default = fastifyAutoload
