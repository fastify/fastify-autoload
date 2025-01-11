import { FastifyPluginCallback } from 'fastify'

const plugin: FastifyPluginCallback = function (fastify, _opts, next): void {
  fastify.get('/typescript', (_request, reply): void => {
    reply.send({ script: 'type' })
  })

  next()
}

export default plugin
