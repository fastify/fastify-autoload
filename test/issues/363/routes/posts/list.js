'use strict'

module.exports = async function (fastify) {
  fastify.get('/', async () => ({ endpoint: 'posts-list' }))
}
