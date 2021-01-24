export default async function (fastify, opts) {
  fastify.get('/default', async (request, reply) => {
    return { script: 'default' }
  })
}
