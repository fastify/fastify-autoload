'use strict'

module.exports = function (f, opts, next) {
  f.get('/', (request, reply) => {
    reply.send({ something: 'else' })
  })

  next()
}

module.exports.autoPrefix = '/prefixed'
