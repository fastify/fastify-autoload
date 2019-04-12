'use strict'

const fp = require('fastify-plugin')

function plugin (f, opts, next) {
  if (!f.pluginE || !f.pluginF) {
    return next()
  }

  f.get('/plugin-b', (request, reply) => {
    reply.send({ data: 'plugin-b' })
  })

  f.decorate('pluginB', true)

  next()
}

module.exports = fp(plugin, {
  name: 'plugin-b',
  dependencies: ['plugin-e']
})
