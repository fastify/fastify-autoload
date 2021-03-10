import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

export default function (fastify: FastifyInstance, _: object, next): void {
  fastify.get('/installed', (_: FastifyRequest, reply: FastifyReply): void => {
    reply.send({ result: 'ok' })
  })

  next()
}
