'use strict'

const fastifyAutoload = require('../../../')

module.exports = function (fastify, opts, next) {
  fastify.register(fastifyAutoload, {
    dir: __dirname
  })

  next()
}

module.exports.autoload = false
