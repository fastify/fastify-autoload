'use strict'

const fp = require('fastify-plugin')

function plugin (f, opts, next) {
  f.get('/plugin-b', (request, reply) => {
    reply.send({ data: 'plugin-b' })
  })

  next()
}

module.exports = fp(plugin, {
  name: 'plugin-b',
  dependencies: ['plugin-e']
})
