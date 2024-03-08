'use strict'

module.exports = function (app, opts, next) {
  app.get('/', async function (req, reply) {
    reply.status(200).send({ hooked: req.hooked })
  })

  next()
}
