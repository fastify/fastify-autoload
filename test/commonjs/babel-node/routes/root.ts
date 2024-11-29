module.exports = async (fastify) => {
  fastify.get('/', function () {
    return { hello: 'world' }
  })
}
