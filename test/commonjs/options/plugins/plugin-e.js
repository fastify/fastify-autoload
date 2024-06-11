'use strict'

const fp = require('fastify-plugin')

function plugin (f, opts, next) {
  f.get('/plugin-e', (request, reply) => {
    reply.send({ data: opts.e })
  })

  next()
}

plugin.autoConfig = (fastify) => {
  return { e: 'test-4-' + fastify.root }
}

exports.default = fp(plugin, { name: 'plugin-e' })
