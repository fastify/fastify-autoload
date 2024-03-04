import { FastifyPluginCallback } from 'fastify'

const plugin: FastifyPluginCallback = function (fastify, opts, next): void {
  fastify.get('/typescript', (request, reply): void => {
    reply.send({ script: 'type' })
  })

  next()
}

export default plugin
