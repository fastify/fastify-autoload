'use strict'

const fp = require('fastify-plugin')

function plugin (f, opts, next) {
  f.get('/plugin-d', (request, reply) => {
    reply.send({ data: 'plugin-d' })
  })

  next()
}

module.exports = fp(plugin, {
  name: 'plugin-d',
  dependencies: ['plugin-e']
})
