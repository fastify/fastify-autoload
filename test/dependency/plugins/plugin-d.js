'use strict'

const fp = require('fastify-plugin')

function plugin (f, opts, next) {
  if (!f.pluginE || !f.pluginF) {
    return next()
  }

  f.get('/plugin-d', (request, reply) => {
    reply.send({ data: 'plugin-d' })
  })

  f.decorate('pluginD', true)

  next()
}

module.exports = fp(plugin, {
  name: 'plugin-d',
  dependencies: ['plugin-e']
})
