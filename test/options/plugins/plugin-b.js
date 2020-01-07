'use strict'

const fp = require('fastify-plugin')

function plugin (f, opts, next) {
  f.get('/plugin-b', (request, reply) => {
    reply.send({ data: opts.b })
  })

  next()
}

plugin.autoConfig = { b: 'test-2' }

module.exports = fp(plugin, { name: 'plugin-b' })
