'use strict'

module.exports = async function (fastify) {
  fastify.get('/', async (req) => ({ item: 1, hooked: req.hooked }))
}
