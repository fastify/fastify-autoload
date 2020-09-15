export default async (server, opts) => {
  server.get('/', async (req, reply) => {
    reply.send({ works: true })
  })
}
