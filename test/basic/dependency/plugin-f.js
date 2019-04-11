'use strict'

const fp = require('fastify-plugin')

function plugin (f, opts, next) {
  f.get('/plugin-f', (request, reply) => {
    reply.send({ data: 'plugin-f' })
  })

  next()
}

module.exports = fp(plugin, {
  name: 'plugin-f'
})
