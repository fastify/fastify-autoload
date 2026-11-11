'use strict'

module.exports = async function (fastify) {
  fastify.addHook('onRequest', async (req) => {
    req.hooked = true
  })
}
