'use strict'

const fp = require('fastify-plugin')

function plugin (f, opts, next) {
  if (!f.pluginF) {
    return next()
  }

  f.get('/plugin-e', (request, reply) => {
    reply.send({ data: 'plugin-e' })
  })

  f.decorate('pluginE', true)

  next()
}

module.exports = fp(plugin, {
  name: 'plugin-e',
  dependencies: ['plugin-f']
})
