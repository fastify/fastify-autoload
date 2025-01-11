import { FastifyPluginCallback } from 'fastify'
import { join } from 'node:path'
const fastifyAutoLoad = require('../../../index')

const app: FastifyPluginCallback = function (fastify, _opts, next): void {
  fastify.register(fastifyAutoLoad, {
    dir: join(__dirname, 'foo'),
  })

  next()
}

export default app
