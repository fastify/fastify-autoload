'use strict'

const fp = require('fastify-plugin')

function plugin (f, opts, next) {
  f.get('/plugin-d', (request, reply) => {
    reply.send({ data: opts.d })
  })

  next()
}

plugin.autoConfig = { d: 'test-3' }

exports.default = fp(plugin, { name: 'plugin-d' })
