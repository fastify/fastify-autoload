import type { FastifyInstance } from 'fastify'

const { join } = require('node:path')
const fastifyAutoLoad = require('../../../index.js')

module.exports = function (fastify: FastifyInstance, _opts: any, next: any) {
  fastify.register(fastifyAutoLoad, {
    dir: join(__dirname, 'foo'),
  })

  next()
}
