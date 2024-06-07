'use strict'

// This module should be ignored because an index.js file is present in the same directory

module.exports = async (server, opts) => {
  server.get('/ignored', async (request, reply) => {
    reply.status(200).send({ works: true })
  })
}
