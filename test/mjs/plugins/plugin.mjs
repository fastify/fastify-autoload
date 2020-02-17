'use strict'

export default function pluginMjs (f, opts, next) {
  f.get('/mjs', (request, reply) => {
    reply.send({ hello: 'world' })
  })

  next()
}
