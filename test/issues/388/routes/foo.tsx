'use strict'

module.exports = async function (app) {
  app.get('/', async function (_req, reply) {
    reply.status(200).send({ tsx: 'ok' })
  })
}
