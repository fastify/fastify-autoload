'use strict'

module.exports.default = function (f, opts, next) {
  f.get('/', (request, reply) => {
    reply.send({ exports: 'default' })
  })

  next()
}

module.exports.autoPrefix = '/default'
