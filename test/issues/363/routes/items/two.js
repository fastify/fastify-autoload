'use strict'

module.exports = async function (fastify) {
  fastify.get('/', async (req) => ({ item: 2, hooked: req.hooked }))
}
