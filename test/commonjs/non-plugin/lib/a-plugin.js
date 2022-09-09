'use strict'

module.exports = async function (server) {
  server.get('/foo', function (req, reply) {
    reply.send('foo')
  })
}
