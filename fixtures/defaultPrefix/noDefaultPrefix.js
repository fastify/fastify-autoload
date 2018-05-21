'use strict'

module.exports = function (f, opts, next) {
  f.get('/noPrefix', (request, reply) => {
    reply.send({ no: 'prefix' })
  })

  next()
}

module.exports.prefixOverride = ''
