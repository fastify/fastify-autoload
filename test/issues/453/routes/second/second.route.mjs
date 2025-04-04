// This folder is not used directly by the test, but in the previous implementation, the last hook used would affect the outcome.
// This folder ensures that the test fails if the fix is reverted or modified incorrectly.
const routes = async (fastify) => {
  fastify.get('/second', async (request) => {
    return { hooksUsed: request.hooksUsed }
  })
}

export default routes
