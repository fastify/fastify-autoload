'use strict'

module.exports = function (f, opts, next) {
  f.get('/typescript', (request, reply) => {
    reply.send({ type: 'script' })
  })

  next()
}
