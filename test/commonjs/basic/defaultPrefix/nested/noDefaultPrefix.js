'use strict'

module.exports = function (f, opts, next) {
  f.get('/noPrefixNested', (request, reply) => {
    reply.send({ no: 'prefixNested' })
  })

  next()
}

module.exports.prefixOverride = ''
