'use strict'

export default function (f, opts, next) {
  f.get('/', (request, reply) => {
    reply.send({ prefixedNested: true })
  })

  next()
}

export const autoPrefix = '/prefixedNested'
