'use strict'

const path = require('path')
const { readdir } = require('fs').promises
const pkgUp = require('pkg-up')
const semver = require('semver')

const typescriptSupport = Symbol.for('ts-node.register.instance') in process
const moduleSupport = semver.satisfies(process.version, '>= 14 || >= 12.17.0 < 13.0.0')

const defaults = {
  scriptPattern: /((^.?|\.[^d]|[^.]d|[^.][^d])\.ts|\.js|\.cjs|\.mjs)$/i,
  indexPattern: /^index(\.ts|\.js|\.cjs|\.mjs)$/i
}

module.exports = async function fastifyAutoload (fastify, options) {
  const packageType = await getPackageType(options.dir)
  const opts = { ...defaults, packageType, ...options }
  const plugins = await findPlugins(opts.dir, opts)
  const pluginsMeta = {}
  for (const { file, type, prefix } of plugins) {
    try {
      const plugin = await loadPlugin(file, type, prefix, opts)
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

async function findPlugins (dir, options, accumulator = [], prefix) {
  const { indexPattern, ignorePattern, scriptPattern } = options
  const list = await readdir(dir, { withFileTypes: true })

  // Contains index file?
  const indexDirent = list.find((dirent) => indexPattern.test(dirent.name))
  if (indexDirent) {
    const file = path.join(dir, indexDirent.name)
    const type = getScriptType(file, options.packageType)
    accumulator.push({ file, type })
    return accumulator
  }

  // Contains package.json but no index.js file?
  const packageDirent = list.find((dirent) => dirent.name === 'package.json')
  if (packageDirent) {
    throw new Error(`fastify-autoload cannot import plugin at '${dir}'. To fix this error rename the main entry file to 'index.js' (or .cjs, .mjs, .ts).`)
  }

  // Otherwise treat each script file as a plugin
  const directoryPromises = []
  for (const dirent of list) {
    if (ignorePattern && dirent.name.match(ignorePattern)) {
      continue
    }

    const file = path.join(dir, dirent.name)
    if (dirent.isDirectory()) {
      directoryPromises.push(findPlugins(file, options, accumulator, dirent.name))
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
      accumulator.push({ file, type, prefix })
    }
  }
  await Promise.all(directoryPromises)

  return accumulator
}

async function loadPlugin (file, type, directoryPrefix, options) {
  const { options: overrideConfig } = options
  let content
  if (type === 'module') {
    content = await import(file)
  } else {
    content = require(file)
  }
  const plugin = wrapRoutes(content.default || content)
  const pluginConfig = (content.default && content.default.autoConfig) || content.autoConfig || {}
  const pluginOptions = Object.assign({}, pluginConfig, overrideConfig)
  const pluginMeta = plugin[Symbol.for('plugin-meta')] || {}

  if (plugin.autoload === false || content.autoload === false) {
    return
  }

  // Reset to support overriding autoConfig for library plugins
  if (plugin.autoConfig !== undefined) {
    plugin.autoConfig = undefined
  }

  const prefixOverride = plugin.prefixOverride !== undefined ? plugin.prefixOverride : content.prefixOverride !== undefined ? content.prefixOverride : undefined
  const prefix = (plugin.autoPrefix !== undefined ? plugin.autoPrefix : content.autoPrefix !== undefined ? content.autoPrefix : undefined) || directoryPrefix
  if (prefixOverride !== undefined) {
    pluginOptions.prefix = prefixOverride
  } else if (prefix) {
    pluginOptions.prefix = (pluginOptions.prefix || '') + prefix
  }

  return {
    plugin,
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
      registerPlugin(fastify, allPlugins[name], allPlugins, parentPlugins)
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
