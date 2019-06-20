import { FastifyPlugin } from '../fastify-aliases'

const TSPlugin: FastifyPlugin = function (f, opts, next): void {
  f.get('/typescript', (request, reply): void => {
    reply.send({ script: 'type' })
  })

  next()
}

export = TSPlugin
