'use strict'

module.exports = function (fastify, opts, next) {
  fastify.get('/javascript', (request, reply) => {
    reply.send({ script: 'java' })
  })

  next()
}
