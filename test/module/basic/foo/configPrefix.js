'use strict'

export default function (f, opts, next) {
  f.get('/', (request, reply) => {
    reply.send({ configPrefix: true })
  })

  next()
}

export const autoConfig = {
  prefix: '/configPrefix'
}
