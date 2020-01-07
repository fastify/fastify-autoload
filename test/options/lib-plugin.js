'use strict'

const fp = require('fastify-plugin')

function plugin (f, opts, next) {
  const { name = 'default' } = opts
  f.get('/plugin-' + name, (request, reply) => {
    reply.send({ data: name })
  })

  next()
}

module.exports = fp(plugin, { name: 'lib-plugin' })
