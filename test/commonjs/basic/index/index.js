'use strict'

module.exports = async (server, opts, next) => {
  server.get('/', async (request, reply) => {
    reply.status(200).send({ works: true })
  })
}
