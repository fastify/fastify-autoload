'use strict'

module.exports = function (f, opts, next) {
  f.get('/commonjs', (request, reply) => {
    reply.send(opts)
  })

  next()
}
