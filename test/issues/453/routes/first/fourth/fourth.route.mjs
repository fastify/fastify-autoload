const routes = async (fastify) => {
  fastify.get('/fourth', async (request) => {
    return { hooksUsed: request.hooksUsed }
  })
}

export default routes
