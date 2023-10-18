'use strict'

module.exports = async (server, opts) => {
  server.get('/', async (request, reply) => {
    reply.status(200).send({ custom: true })
  })
}
