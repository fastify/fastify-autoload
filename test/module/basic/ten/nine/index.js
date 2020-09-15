export default async (server, opts) => {
  server.get('/eight', async (req, reply) => {
    reply.send({ works: true })
  })
}
