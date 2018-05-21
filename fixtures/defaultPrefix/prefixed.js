'use strict'

module.exports = function (f, opts, next) {
  f.get('/', (request, reply) => {
    reply.send({ prefixed: true })
  })

  next()
}

module.exports.autoPrefix = '/prefixed'
