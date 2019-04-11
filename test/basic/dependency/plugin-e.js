'use strict'

const fp = require('fastify-plugin')

function plugin (f, opts, next) {
  f.get('/plugin-e', (request, reply) => {
    reply.send({ data: 'plugin-e' })
  })

  next()
}

module.exports = fp(plugin, {
  name: 'plugin-e',
  dependencies: ['plugin-f']
})
