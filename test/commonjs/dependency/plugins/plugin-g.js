'use strict'

const fp = require('fastify-plugin')

function plugin (f, opts, next) {
  f.get('/plugin-g', (request, reply) => {
    const data = request.urlData()

    reply.send(data)
  })

  next()
}

module.exports = fp(plugin, {
  name: 'plugin-g',
  dependencies: ['fastify-url-data']
})
