'use strict'

const fp = require('fastify-plugin')

function plugin (f, opts, next) {
  const { name } = opts
  f.get('/plugin-' + name, (request, reply) => {
    reply.send({ data: name })
  })

  next()
}

plugin.options = { name: 'default' }

module.exports = fp(plugin, { name: 'lib-plugin' })
