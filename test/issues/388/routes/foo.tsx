'use strict'

module.exports = async function (app, opts) {
  app.get('/', async function (req, reply) {
    reply.status(200).send({ tsx: 'ok' })
  })
}
