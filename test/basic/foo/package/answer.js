'use strict'

module.exports = function (f, opts, next) {
  f.get('/package', (request, reply) => {
    reply.send({ answer: 42 })
  })

  next()
}
