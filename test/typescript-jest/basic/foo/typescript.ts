import { FastifyPlugin } from 'fastify'

const plugin: FastifyPlugin = function (fastify, opts, next): void {
  fastify.get('/typescript', (request, reply): void => {
    reply.send({ script: 'type' })
  })

  next()
}

export default plugin
