'use strict'

const fp = require('fastify-plugin')

module.exports = fp(function (fastify, opts, next) {
  fastify.get('/b', function (_request, reply) {
    reply.send(opts)
  })
  next()
}, {
  dependencies: ['plugin-d'],
  name: 'plugin-b'
})
