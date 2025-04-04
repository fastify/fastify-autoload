const routes = async (fastify) => {
  fastify.get('/global', async (request) => {
    return { hooksUsed: request.hooksUsed }
  })
}

export default routes
