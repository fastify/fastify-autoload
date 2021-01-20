export default async function (fastify, opts) {
  fastify.get('/star-named', async (request, reply) => {
    return { script: 'star-named' }
  })
}
