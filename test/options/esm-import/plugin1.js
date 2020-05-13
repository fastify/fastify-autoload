export default function (fastify, opts, next) {
  fastify.get('/', (_request, reply) => reply.send('ok'))
  next()
}
