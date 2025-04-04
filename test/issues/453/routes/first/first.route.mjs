const routes = async (fastify) => {
  fastify.get('/first', async (request) => {
    return { hooksUsed: request.hooksUsed }
  })
}

export default routes
