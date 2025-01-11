'use strict'

module.exports = async function (app) {
  app.get('/', async function (req, reply) {
    reply.status(200).send({ hooked: req.hooked })
  })
}
