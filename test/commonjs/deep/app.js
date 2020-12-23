'use strict'

const path = require('path')
const autoLoad = require('../../../')

module.exports = function (fastify, opts, next) {
  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: {
      prefix: '/with-dirs'
    }
  })

  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'routes'),
    dirNameRoutePrefix: false,
    options: {
      prefix: '/without-dirs'
    }
  })

  next()
}
