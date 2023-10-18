'use strict'

module.exports = async (server, opts) => {
  server.get('/three', async (req, reply) => {
    reply.send({ works: true })
  })
}
