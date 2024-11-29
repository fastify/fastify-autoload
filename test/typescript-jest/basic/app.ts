import { FastifyPluginCallback } from 'fastify'
import { join } from 'path'
const fastifyAutoLoad = require('../../../index')

const app: FastifyPluginCallback = function (fastify, opts, next): void {
  fastify.register(fastifyAutoLoad, {
    dir: join(__dirname, 'foo'),
  })

  next()
}

export default app
