'use strict'

module.exports = function (f, opts, next) {
  f.get('/items/:id', (request, reply) => {
    reply.send({ answer: 42 })
  })

  next()
}
