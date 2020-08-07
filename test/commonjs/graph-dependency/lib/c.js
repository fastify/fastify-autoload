'use strict'

const fp = require('fastify-plugin')

module.exports = fp(function (fastify, opts, next) {
  fastify.get('/c', function (_request, reply) {
    reply.send(opts)
  })
  next()
}, {
  dependencies: ['plugin-d'],
  name: 'plugin-c'
})
