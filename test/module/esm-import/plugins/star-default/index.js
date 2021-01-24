export default async function (fastify, opts) {
  fastify.get('/star-default', async (request, reply) => {
    return { script: 'star-default' }
  })
}
