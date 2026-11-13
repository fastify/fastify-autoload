'use strict'

module.exports = async function (app) {
  app.addHook('onRequest', async (req, reply) => {
    if (!req.headers.authorization) return reply.code(401).send({ error: 'unauthorized' })
  })
}
