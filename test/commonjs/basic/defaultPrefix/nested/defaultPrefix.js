'use strict'

module.exports = function (f, opts, next) {
  f.get('/', (request, reply) => {
    reply.send({ indexNested: true })
  })

  next()
}
