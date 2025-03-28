const routes = async (fastify) => {
  fastify.get('/second', async (request) => {
    return { hooksUsed: request.hooksUsed }
  })
}

export default routes
