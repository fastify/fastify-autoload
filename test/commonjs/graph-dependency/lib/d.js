'use strict'

const fp = require('fastify-plugin')

module.exports = fp(function (fastify, opts, next) {
  fastify.get('/d', function (_request, reply) {
    reply.send(opts)
  })
  next()
}, {
  name: 'plugin-d'
})
