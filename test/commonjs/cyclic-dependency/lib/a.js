'use strict'

const fp = require('fastify-plugin')

module.exports = fp(function (fastify, opts, next) {
  fastify.get('/a', function (_request, reply) {
    reply.send(opts)
  })
  next()
}, {
  dependencies: ['plugin-b'],
  name: 'plugin-a'
})
