'use strict'

export default function (f, opts, next) {
  f.get('/', (request, reply) => {
    reply.send({ configPrefixCallback: true })
  })

  next()
}

export const autoConfig = () => ({})
autoConfig.prefix = '/configPrefixCallback'
