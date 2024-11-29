module.exports.default = async (fastify: any) => {
  fastify.get('/customPath', function () {
    return { baz: 'baz' }
  })
}
