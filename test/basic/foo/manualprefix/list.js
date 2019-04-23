'use strict'

module.exports = function (f, opts, next) {
  f.get('/items', (request, reply) => {
    reply.send([{ answer: 42 }, { answer: 41 }])
  })

  next()
}
