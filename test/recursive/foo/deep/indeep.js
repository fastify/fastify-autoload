'use strict'

module.exports = function (f, opts, next) {
  f.get('/indeep', (request, reply) => {
    reply.send({ deeper: 'so deep' })
  })

  next()
}
