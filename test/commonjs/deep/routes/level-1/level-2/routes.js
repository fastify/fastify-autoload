'use strict'

function deepPlugin (f, opts, next) {
  f.get('/deep-route', (request, reply) => {
    reply.send({ data: 'deep-route' })
  })

  next()
}

module.exports = deepPlugin
