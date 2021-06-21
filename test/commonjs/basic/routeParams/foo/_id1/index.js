module.exports = async (server, opts, next) => {
  server.get('/', async (request, reply) => {
    const params = request.params
    reply.status(200).send({ works: true, ...params })
  })
}
