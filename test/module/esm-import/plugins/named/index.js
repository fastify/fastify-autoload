export default async function (fastify, opts) {
  fastify.get('/named', async (request, reply) => {
    return { script: 'named' }
  })
}
