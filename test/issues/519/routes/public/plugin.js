'use strict'

module.exports = async function (fastify) {
  fastify.get('/', async () => ({ zone: 'public' }))
}
