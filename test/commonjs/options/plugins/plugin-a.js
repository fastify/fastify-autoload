'use strict'

const fp = require('fastify-plugin')

function plugin (f, opts, next) {
  f.get('/plugin-a', (request, reply) => {
    reply.send({ data: opts.a })
  })

  next()
}

plugin.autoConfig = { a: 'test-1' }

module.exports = fp(plugin, { name: 'plugin-a' })
