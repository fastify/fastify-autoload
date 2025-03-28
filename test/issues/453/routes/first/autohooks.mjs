const pluginRegister = async (fastify) => {
  fastify.addHook('onRequest', async (request) => {
    request.hooksUsed.push('first')
  })
}

export default pluginRegister
