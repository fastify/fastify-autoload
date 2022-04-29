'use strict'

const path = require('path')
const fastifyUrlData = require('@fastify/url-data')

const AutoLoad = require('../../../')

module.exports = function (fastify, opts, next) {
  fastify.register(fastifyUrlData)

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins')
  })

  next()
}
