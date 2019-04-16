'use strict'

const fs = require('fs')
const path = require('path')
const steed = require('steed')

module.exports = function (fastify, opts, next) {
  const defaultPluginOptions = opts.options

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

            cb(null, {
              // skip directories withoud .js files inside
              skip: files.every(name => !name.match(/.js$/)),
              file: toLoad
            })
          })
        } else {
          cb(null, {
            // only accept .js files
            skip: !(stat.isFile() && file.match(/.js$/)),
            file: toLoad
          })
        }
      })
    }, (err, stats) => {
      if (err) {
        next(err)
        return
      }

      const allPlugins = {}

      for (let i = 0; i < stats.length; i++) {
        const { skip, file } = stats[i]

        if (skip) {
          continue
        }

        try {
          const plugin = require(file)
          const pluginOptions = Object.assign({}, defaultPluginOptions)
          const pluginMeta = plugin[Symbol.for('plugin-meta')] || {}
          const pluginName = pluginMeta.name || file

          if (plugin.autoload === false) {
            continue
          }

          if (plugin.autoPrefix) {
            const prefix = pluginOptions.prefix || ''
            pluginOptions.prefix = prefix + plugin.autoPrefix
          }

          if (plugin.prefixOverride !== void 0) {
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
