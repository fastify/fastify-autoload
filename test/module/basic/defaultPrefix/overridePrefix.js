'use strict'

export default function (f, opts, next) {
  f.get('/', (request, reply) => {
    reply.send({ overide: 'prefix' })
  })

  next()
}

export const autoPrefix = '/notUsed'

export const prefixOverride = '/overriddenPrefix'
