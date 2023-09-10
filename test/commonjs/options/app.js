'use strict'

const path = require('node:path')
const fastifyUrlData = require('@fastify/url-data')

const AutoLoad = require('../../../')

module.exports = function (fastify, opts, next) {
  fastify.register(fastifyUrlData)

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: {
      b: 'override'
    }
  })

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins-2')
  })

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins-3')
  })

  next()
}
