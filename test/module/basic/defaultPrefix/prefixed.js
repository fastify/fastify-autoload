'use strict'

export default function (f, opts, next) {
  f.get('/', (request, reply) => {
    reply.send({ prefixed: true })
  })

  next()
}

export const autoPrefix = '/prefixed'
