'use strict'

const fs = require('fs')
const path = require('path')
const steed = require('steed')

module.exports = function (fastify, opts, next) {
  const defaultPluginOptions = opts.options || {}
  fs.readdir(opts.dir, function (err, list) {
    if (err) {
      next(err)
      return
    }

    steed.map(
      list,
      (file, cb) => {
        const toLoad = path.join(opts.dir, file)
        fs.stat(toLoad, (err, stat) => {
          if (err) {
            cb(err)
            return
          }

          cb(null, { file: toLoad, stat })
        })
      },
      (err, stats) => {
        if (err) {
          next(err)
          return
        }
        for (let i = 0; i < stats.length; i++) {
          const { stat, file } = stats[i]

          if (
            stat.isFile() &&
            (!file.match(/.js$/) ||
              (opts.ignorePattern && file.match(opts.ignorePattern)))
          ) {
            continue
          }

          // TODO handle empty directories
          // TODO handle directories with a package.json
          if (stat.isFile() || stat.isDirectory()) {
            try {
              const plugin = require(file)
              const pluginOptions = {}
              Object.assign(pluginOptions, defaultPluginOptions)
              if (plugin.autoPrefix) {
                const prefix = pluginOptions.prefix || ''
                pluginOptions.prefix = prefix + plugin.autoPrefix
              }
              if (plugin.prefixOverride !== void 0) {
                pluginOptions.prefix = plugin.prefixOverride
              }
              if (plugin.autoload !== false) {
                fastify.register(plugin, pluginOptions)
              }
            } catch (err) {
              // Hack SyntaxError message so that we provide
              // the line number to the user, otherwise they
              // will be left in the cold.
              if (err instanceof SyntaxError) {
                err.message += ' at ' + err.stack.split('\n')[0]
              }
              next(err)
              return
            }
          }
        }

        next()
      }
    )
  })
}

// do not create a new context, do not encapsulate
// same as fastify-plugin
module.exports[Symbol.for('skip-override')] = true
