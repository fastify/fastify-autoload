'use strict'

module.exports = async function (app) {
  app.get('/', async function (req, reply) {
    reply.send()
  })
}
