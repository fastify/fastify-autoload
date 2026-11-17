'use strict'

module.exports = async function (app) {
  app.addHook('onRequest', async (req, reply) => {
    if (req.headers['x-role'] !== 'admin') return reply.code(403).send({ error: 'forbidden' })
  })
}
