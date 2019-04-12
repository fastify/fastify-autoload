'use strict'

const fp = require('fastify-plugin')

function plugin (f, opts, next) {
  f.get('/plugin-a', (request, reply) => {
    reply.send({ data: 'plugin-a' })
  })

  next()
}

module.exports = fp(plugin, {
  name: 'plugin-a',
  dependencies: ['plugin-d']
})
