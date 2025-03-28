const pluginRegister = async (fastify) => {
  fastify.addHook('onRequest', async (request) => {
    request.hooksUsed.push('global')
  })
}

export default pluginRegister
