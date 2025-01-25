module.exports = function (fastify: any, _opts, next) {
  fastify.get('/typescript', (_request, reply) => {
    reply.send({ script: 'type' })
  })

  next()
}
