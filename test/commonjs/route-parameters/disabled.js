'use strict'

const path = require('node:path')
const autoLoad = require('../../../')

module.exports = function (fastify, opts, next) {
  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'routes'),
    routeParams: false
  })

  next()
}
