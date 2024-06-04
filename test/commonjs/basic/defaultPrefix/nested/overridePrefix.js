'use strict'

module.exports = function (f, opts, next) {
  f.get('/', (request, reply) => {
    reply.send({ overide: 'prefixNested' })
  })

  next()
}

module.exports.autoPrefix = '/notUsed'

module.exports.prefixOverride = '/overriddenPrefixNested'
