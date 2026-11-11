'use strict'

module.exports = async function (fastify) {
  fastify.get('/', async () => ({ endpoint: 'root-endpoint' }))
}
