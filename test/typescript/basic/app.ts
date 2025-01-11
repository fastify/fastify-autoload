import { FastifyPluginCallback } from 'fastify'
import { join } from 'node:path'
import fastifyAutoLoad from '../../../'

const app: FastifyPluginCallback = function (fastify, _opts, next): void {
  fastify.register(fastifyAutoLoad, {
    dir: join(__dirname, 'foo'),
  })

  next()
}

export default app
