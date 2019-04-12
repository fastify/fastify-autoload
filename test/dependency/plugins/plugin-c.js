'use strict'

const fp = require('fastify-plugin')

function plugin (f, opts, next) {
  f.get('/plugin-c', (request, reply) => {
    reply.send({ data: 'plugin-c' })
  })

  next()
}

module.exports = fp(plugin, {
  name: 'plugin-c',
  dependencies: ['plugin-e']
})
