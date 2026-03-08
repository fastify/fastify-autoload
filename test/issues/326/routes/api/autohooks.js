'use strict'

module.exports = async function (app) {
  app.setNotFoundHandler(function (req, reply) {
    reply.status(404).send({ scope: 'api', url: req.url })
  })
}
