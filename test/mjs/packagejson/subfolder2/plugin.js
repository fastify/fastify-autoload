'use strict'

export default function pluginMjs (f, opts, next) {
  f.get('/js-module-subfolder', (request, reply) => {
    reply.send({ hello: 'world' })
  })

  next()
}
