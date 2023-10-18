'use strict'

module.exports = function (fastify, opts, next) {
  fastify.register(require('./list'))
  fastify.register(require('./get'))

  next()
}

module.exports.autoPrefix = '/semiautomatic'
