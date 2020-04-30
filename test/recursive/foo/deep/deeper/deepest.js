'use strict'

module.exports = function (f, opts, next) {
  f.get('/deepest', (request, reply) => {
    reply.send({ deepest: 'the deepest' })
  })

  next()
}
