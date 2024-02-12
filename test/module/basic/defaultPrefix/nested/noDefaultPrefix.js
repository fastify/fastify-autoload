'use strict'

export default function (f, opts, next) {
  f.get('/noPrefixNested', (request, reply) => {
    reply.send({ no: 'prefixNested' })
  })

  next()
}

export const prefixOverride = ''
