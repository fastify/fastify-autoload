'use strict'

module.exports = function (f, opts, next) {
  f.get('/', (request, reply) => {
    reply.send({ prefixedNested: true })
  })

  next()
}

module.exports.autoPrefix = '/prefixedNested'
