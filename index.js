'use strict'

const fs = require('fs')
const path = require('path')
const { promisify } = require('es6-promisify')

const getStat = promisify(fs.stat)
const readDir = promisify(fs.readdir)

module.exports = function (fastify, opts) {
  const defaultPluginOptions = opts.options
  return loadPluginFiles(opts).then((files) => {
    const stats = [].concat(...files)

    const allPlugins = {}
    const promises = []
    for (const { skip, file, opts, isModule } of stats) {
      if (skip) {
        continue
      }

      promises.push(importPluginAndMetaData(file, opts, isModule, allPlugins, defaultPluginOptions))
    }
    return Promise.all(promises)
      .then(() => allPlugins)
  }).then((allPlugins) => {
    const loadedPlugins = {}

    function registerPlugin (name, plugin, options) {
      if (loadedPlugins[name]) return

      fastify.register(plugin.default || plugin, options)
      loadedPlugins[name] = true
    }

    let cyclicDependencyCheck = {}

    function loadPlugin ({ plugin, name, dependencies = [], options }) {
      if (cyclicDependencyCheck[name]) throw new Error('Cyclic dependency')

      if (dependencies.length) {
        cyclicDependencyCheck[name] = true
        dependencies.forEach((name) => allPlugins[name] && loadPlugin(allPlugins[name]))
      }

      registerPlugin(name, plugin, options)
    }

    const pluginKeys = Object.keys(allPlugins)
    for (let i = 0; i < pluginKeys.length; i++) {
      cyclicDependencyCheck = {}

      try {
        const plugin = allPlugins[pluginKeys[i]]
        if (plugin == null) {
          continue
        }
        loadPlugin(plugin)
      } catch (err) {
        throw enrichError(err)
      }
    }
  })
}

// do not create a new context, do not encapsulate
// same as fastify-plugin
module.exports[Symbol.for('skip-override')] = true

function importPluginAndMetaData (file, opts, isModule, allPlugins, defaultPluginOptions) {
  return importPlugin(file, isModule).then((content) => {
    const plugin = wrapRoutes(content)
    const pluginConfig = (plugin.default && plugin.default.autoConfig) || plugin.autoConfig || {}
    const pluginOptions = Object.assign({}, pluginConfig, defaultPluginOptions)
    const pluginMeta = plugin[Symbol.for('plugin-meta')] || {}
    const pluginName = pluginMeta.name || file

    if (plugin.default && plugin.default.autoConfig && typeof plugin.default.autoConfig === 'object') {
      plugin.default.autoConfig = undefined
    }

    if (typeof plugin.autoConfig === 'object') {
      plugin.autoConfig = undefined
    }

    if (opts && !plugin.autoPrefix) {
      plugin.autoPrefix = opts.prefix
    }

    if (plugin.autoload === false) {
      return null
    }

    if (plugin.autoPrefix) {
      const prefix = pluginOptions.prefix || ''
      pluginOptions.prefix = prefix + plugin.autoPrefix
    }

    if (plugin.prefixOverride !== undefined) {
      pluginOptions.prefix = plugin.prefixOverride
    }

    if (allPlugins[pluginName]) {
      throw new Error(`Duplicate plugin: ${pluginName}`)
    }

    allPlugins[pluginName] = {
      plugin,
      name: pluginName,
      dependencies: pluginMeta.dependencies,
      options: pluginOptions
    }
  }).catch((err) => {
    throw enrichError(err)
  })
}

function wrapRoutes (content) {
  if (content &&
    Object.prototype.toString.apply(content) === '[object Object]' &&
    Object.prototype.hasOwnProperty.call(content, 'method')) {
    return function (fastify, opts, next) {
      fastify.route(content)
      next()
    }
  } else {
    return content
  }
}

function importPlugin (file, isModule) {
  if (isModule) {
    return import(file)
  } else {
    try {
      return Promise.resolve(require(file))
    } catch (err) {
      return Promise.reject(err)
    }
  }
}

function loadPluginFiles (opts) {
  const packagePattern = /^package\.json$/im
  const indexPattern = opts.includeTypeScript
    ? /^index\.(ts|js|mjs)$/im
    : /^index\.(js|mjs)$/im
  const scriptPattern = opts.includeTypeScript
    ? /((^.?|\.[^d]|[^.]d|[^.][^d])\.ts|\.js|\.mjs)$/im // For .ts files, ignore .d.ts
    : /\.(js|mjs)$/im

  return readDir(opts.dir).then((list) => {
    const promises = []
    for (const file of list) {
      promises.push(loadPluginFile(opts, file, packagePattern, indexPattern, scriptPattern))
    }

    return Promise.all(promises).then(flat)
  })
}

function loadPluginFile (opts, file, packagePattern, indexPattern, scriptPattern) {
  if (opts.ignorePattern && file.match(opts.ignorePattern)) {
    return Promise.resolve([{ skip: true }])
  }
  const toLoad = path.join(opts.dir, file)
  return getStat(toLoad).then((stat) => {
    if (stat.isDirectory()) {
      return findPluginsInDirectory(toLoad, packagePattern, indexPattern, scriptPattern)
    } else {
      return [{
        // only accept script files
        skip: !(stat.isFile() && scriptPattern.test(file)),
        file: toLoad,
        isModule: file.endsWith('.mjs')
      }]
    }
  })
}

function findPluginsInDirectory (toLoad, packagePattern, indexPattern, scriptPattern) {
  return readDir(toLoad).then((files) => {
    const fileList = files.join('\n')
    const moduleDefinedByPackageJson = hasModuleDefinedInPackageJson(toLoad)
    // if the directory does not contain a package.json or an index,
    // load each script file as an independend plugin
    if (
      !packagePattern.test(fileList) &&
      !indexPattern.test(fileList) &&
      scriptPattern.test(fileList)
    ) {
      const plugins = []
      for (let index = 0; index < files.length; index++) {
        const file = files[index]

        plugins.push({
          skip: !scriptPattern.test(file),
          opts: {
            prefix: toLoad.split(path.sep).pop()
          },
          file: path.join(toLoad, file),
          isModule: file.endsWith('.mjs') || moduleDefinedByPackageJson
        })
      }
      return plugins
    } else if (moduleDefinedByPackageJson) {
      const plugins = []
      for (let index = 0; index < files.length; index++) {
        const file = files[index]
        if (file === 'package.json') {
          continue
        }

        plugins.push({
          skip: !scriptPattern.test(file),
          opts: {
            prefix: toLoad.split(path.sep).pop()
          },
          file: path.join(toLoad, file),
          isModule: moduleDefinedByPackageJson
        })
      }
      return plugins
    } else {
      return [{
        // skip directories without script files inside
        skip: files.every(name => !scriptPattern.test(name)),
        file: toLoad,
        isModule: toLoad.endsWith('.mjs')
      }]
    }
  })
}

function hasModuleDefinedInPackageJson (directory) {
  try {
    const { type } = require(path.join(directory, '/package.json'))
    return type === 'module'
  } catch (ignore) {
    const index = directory.lastIndexOf('/')
    const parentDirectory = directory.substring(0, index)
    try {
      const { type } = require(path.join(parentDirectory, '/package.json'))
      return type === 'module'
    } catch (ignore) {
      return false
    }
  }
}

function flat (array) {
  return [].concat.apply([], array)
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
