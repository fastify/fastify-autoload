'use strict'

const fs = require('fs')
const path = require('path')
const steed = require('steed')

module.exports = function (fastify, opts, next) {
  const defaultPluginOptions = opts.options

  const packagePattern = /^package\.json$/im
  const indexPattern = opts.includeTypeScript
    ? /^index\.(ts|js)$/im
    : /^index\.js$/im
  const scriptPattern = opts.includeTypeScript
    ? /((^.?|\.[^d]|[^.]d|[^.][^d])\.ts|\.js)$/im // For .ts files, ignore .d.ts
    : /\.js$/im

  function enrichError (err) {
    // Hack SyntaxError message so that we provide
    // the line number to the user, otherwise they
    // will be left in the cold.
    if (err instanceof SyntaxError) {
      err.message += ' at ' + err.stack.split('\n')[0]
    }

    return err
  }

  fs.readdir(opts.dir, function (err, list) {
    if (err) {
      next(err)
      return
    }

    steed.map(list, (file, cb) => {
      if (opts.ignorePattern && file.match(opts.ignorePattern)) {
        cb(null, { skip: true }) // skip files matching `ignorePattern`
        return
      }

      const toLoad = path.join(opts.dir, file)
      fs.stat(toLoad, (err, stat) => {
        if (err) {
          cb(err)
          return
        }

        if (stat.isDirectory()) {
          fs.readdir(toLoad, (err, files) => {
            if (err) {
              cb(err)
              return
            }

            const fileList = files.join('\n')
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
                  file: path.join(toLoad, file)
                })
              }
              cb(null, plugins)
            } else {
              cb(null, {
                // skip directories without script files inside
                skip: files.every(name => !scriptPattern.test(name)),
                file: toLoad
              })
            }
          })
        } else {
          cb(null, {
            // only accept script files
            skip: !(stat.isFile() && scriptPattern.test(file)),
            file: toLoad
          })
        }
      })
    }, (err, files) => {
      if (err) {
        next(err)
        return
      }

      const stats = [].concat(...files)

      const allPlugins = {}

      for (let i = 0; i < stats.length; i++) {
        const { skip, file, opts } = stats[i]

        if (skip) {
          continue
        }

        try {
          const content = require(file)
          let plugin
          if (content &&
            Object.prototype.toString.apply(content) === '[object Object]' &&
            Object.prototype.hasOwnProperty.call(content, 'method')) {
            plugin = function (fastify, opts, next) {
              fastify.route(content)
              next()
            }
          } else {
            plugin = content
          }
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
            continue
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
        } catch (err) {
          next(enrichError(err))
          return
        }
      }

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
          loadPlugin(allPlugins[pluginKeys[i]])
        } catch (err) {
          next(enrichError(err))
          return
        }
      }

      next()
    })
  })
}

// do not create a new context, do not encapsulate
// same as fastify-plugin
module.exports[Symbol.for('skip-override')] = true
