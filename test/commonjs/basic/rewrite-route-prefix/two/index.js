'use strict'

module.exports = async (server, opts) => {
  server.get('/two', async (req, reply) => {
    reply.send({ works: true })
  })
}
