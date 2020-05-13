'use strict'

export default function (f, opts, next) {
  f.get('/skip', (request, reply) => {
    reply.send('skip')
  })

  next()
}

export const autoload = false
