import { FastifyPluginCallback } from 'fastify'
import { join } from 'path'
import fastifyAutoLoad from '../../../'

const app: FastifyPluginCallback = function (fastify, opts, next): void {
  fastify.register(fastifyAutoLoad, {
    dir: join(__dirname, 'foo'),
  })

  next()
}

export default app;
