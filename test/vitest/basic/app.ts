import {FastifyInstance, FastifyServerOptions} from 'fastify'
import {join} from "path";
const fastifyAutoLoad = require('../../../index')

export default async (fastify: FastifyInstance, opts?: FastifyServerOptions) => {
  void fastify.register(fastifyAutoLoad, {
    dir: join(__dirname, 'foo')
  })

  return fastify
}
