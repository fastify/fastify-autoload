'use strict'

export default function (f, opts, next) {
  f.get('/noPrefix', (request, reply) => {
    reply.send({ no: 'prefix' })
  })

  next()
}

export const prefixOverride = ''
