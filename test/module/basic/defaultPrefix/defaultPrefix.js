'use strict'

export default function (f, opts, next) {
  f.get('/', (request, reply) => {
    reply.send({ index: true })
  })

  next()
}
