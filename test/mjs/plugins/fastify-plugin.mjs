'use strict'

import fastifyPlugin from 'fastify-plugin'

function pluginMjs (f, opts, next) {
  f.get('/mjs-fastify-plugin', (request, reply) => {
    reply.send({ hello: 'world' })
  })

  next()
}

export default fastifyPlugin(pluginMjs)
