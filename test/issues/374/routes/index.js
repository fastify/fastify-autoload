'use strict'

module.exports = async function (app, opts, next) {
  app.get('/', async function (req, reply) {
    reply.status(200).send({ path: req.url })
  })
}
