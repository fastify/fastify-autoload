'use strict'

export default function pluginMjs (f, opts, next) {
  f.get('/js-module', (request, reply) => {
    reply.send({ hello: 'world' })
  })

  next()
}
