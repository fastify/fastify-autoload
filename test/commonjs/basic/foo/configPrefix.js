'use strict'

module.exports = function (f, opts, next) {
  f.get('/', (request, reply) => {
    reply.send({ configPrefix: true })
  })

  next()
}

module.exports.autoConfig = {
  prefix: '/configPrefix'
}
