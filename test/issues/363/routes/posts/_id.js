'use strict'

module.exports = async function (fastify) {
  fastify.get('/', async (req) => ({ endpoint: 'posts-detail', id: req.params.id }))
}
