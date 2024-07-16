'use strict'

module.exports = async (fastify, opts) => {
  fastify.get('/encapsulate', {
    handler: async (request, reply) => {
      reply.status(200).send({ works: fastify.sharedVar })
    },
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            works: { type: 'boolean' }
          }
        }
      }
    }
  })
}
