'use strict'

const fs = require('fs')
const path = require('path')
const steed = require('steed')

module.exports = function (fastify, opts, next) {
  fs.readdir(opts.dir, function (err, list) {
    if (err) {
      next(err)
      return
    }

    steed.map(list, (file, cb) => {
      const toLoad = path.join(opts.dir, file)
      fs.stat(toLoad, (err, stat) => {
        if (err) {
          cb(err)
          return
        }

        cb(null, { file: toLoad, stat })
      })
    }, (err, stats) => {
      if (err) {
        next(err)
        return
      }
      for (let i = 0; i < stats.length; i++) {
        const { stat, file } = stats[i]
        if (stat.isFile() && !file.match(/.js$/)) {
          continue
        }

        // TODO handle empty directories
        // TODO handle directories with a package.json
        if (stat.isFile() || stat.isDirectory()) {
          try {
            const plugin = require(file)
            const opts = {}
            if (plugin.autoPrefix) {
              opts.prefix = plugin.autoPrefix
            }
            fastify.register(plugin, opts)
          } catch (err) {
            next(err)
            return
          }
        }
      }

      next()
    })
  })
}

// do not create a new context, do not encapsulate
// same as fastify-plugin
module.exports[Symbol.for('skip-override')] = true
