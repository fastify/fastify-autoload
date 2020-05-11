'use strict'

const promisify = require('util').promisify
const fs = require('fs')
const path = require('path')
const readDirectory = promisify(fs.readdir)

const defaults = {
  scriptPattern: /((^.?|\.[^d]|[^.]d|[^.][^d])\.ts|\.js|\.cjs|\.mjs)$/i,
  indexPattern: /^index(\.ts|\.js|\.cjs|\.mjs)$/i
}

module.exports = async function fastifyAutoload (fastify, options) {
  const opts = { ...defaults, ...options }
  const plugins = await findPlugins(opts.dir, opts)

  const pluginsMeta = {}
  for (const { file, prefix } of plugins) {
    try {
      const plugin = await loadPlugin(file, prefix, opts.options)
      if (plugin) {
        pluginsMeta[plugin.name] = plugin
      }
    } catch (err) {
      throw enrichError(err)
    }
  }

  for (const name in pluginsMeta) {
    const plugin = pluginsMeta[name]
    registerPlugin(fastify, plugin, pluginsMeta)
  }
}

async function findPlugins (dir, options, accumulator = [], prefix) {
  const { ignorePattern, scriptPattern, indexPattern } = options
  const list = await readDirectory(dir, { withFileTypes: true })

  // Contains package.json?
  const packageDirent = list.find((dirent) => dirent.name === 'package.json')
  if (packageDirent) {
    // Skip packages if no js file inside (why?)
    if (list.some(dirent => scriptPattern.test(dirent.name))) {
      accumulator.push({ file: dir })
    }
    return accumulator
  }

  // Contains index file?
  const indexDirent = list.find((dirent) => indexPattern.test(dirent.name))
  if (indexDirent) {
    const fpath = path.join(dir, indexDirent.name)
    accumulator.push({ file: fpath })
    return accumulator
  }

  // Otherwise treat each script file as a plugin
  const directoryPromises = []
  for (const dirent of list) {
    if (ignorePattern && dirent.name.match(ignorePattern)) {
      continue
    }

    const fpath = path.join(dir, dirent.name)
    if (dirent.isDirectory()) {
      directoryPromises.push(findPlugins(fpath, options, accumulator, dirent.name))
      continue
    }

    if (dirent.isFile() && scriptPattern.test(dirent.name)) {
      accumulator.push({ file: fpath, prefix })
    }
  }
  await Promise.all(directoryPromises)

  return accumulator
}

async function loadPlugin (file, prefix, defaultPluginOptions) {
  const { default: content } = await import(file)
  const plugin = wrapRoutes(content)
  const pluginConfig = (plugin.default && plugin.default.autoConfig) || plugin.autoConfig || {}
  const pluginOptions = Object.assign({}, pluginConfig, defaultPluginOptions)
  const pluginMeta = plugin[Symbol.for('plugin-meta')] || {}
  const pluginName = pluginMeta.name || file

  if (plugin.autoload === false) {
    return
  }

  if (plugin.default && plugin.default.autoConfig && typeof plugin.default.autoConfig === 'object') {
    plugin.default.autoConfig = undefined
  }

  if (typeof plugin.autoConfig === 'object') {
    plugin.autoConfig = undefined
  }

  if (!plugin.autoPrefix) {
    plugin.autoPrefix = prefix
  }

  if (plugin.autoPrefix) {
    const prefix = pluginOptions.prefix || ''
    pluginOptions.prefix = prefix + plugin.autoPrefix
  }

  if (plugin.prefixOverride !== undefined) {
    pluginOptions.prefix = plugin.prefixOverride
  }

  return {
    plugin,
    name: pluginName,
    dependencies: pluginMeta.dependencies,
    options: pluginOptions
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
      registerPlugin(fastify, allPlugins[name], allPlugins, parentPlugins)
    }
  }

  fastify.register(plugin.default || plugin, options)
  meta.registered = true
}

function wrapRoutes (content) {
  if (content &&
    Object.prototype.toString.call(content) === '[object Object]' &&
    Object.prototype.hasOwnProperty.call(content, 'method')) {
    return function (fastify, opts, next) {
      fastify.route(content)
      next()
    }
  }
  return content
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
module.exports[Symbol.for('skip-override')] = true
