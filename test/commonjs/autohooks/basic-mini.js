'use strict'

const path = require('node:path')
const autoLoad = require('../../../')

module.exports = function (fastify, opts, next) {
  fastify.log.error(__dirname)

  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'routes-mini'),
    autoHooks: true
  })

  next()
}
