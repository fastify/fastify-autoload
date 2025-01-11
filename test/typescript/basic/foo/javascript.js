'use strict'

module.exports = function (fastify, _opts, next) {
  fastify.get('/javascript', (_request, reply) => {
    reply.send({ script: 'java' })
  })

  next()
}
