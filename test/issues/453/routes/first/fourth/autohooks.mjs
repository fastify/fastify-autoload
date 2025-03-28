const pluginRegister = async (fastify) => {
  fastify.addHook('onRequest', async (request) => {
    request.hooksUsed.push('fourth')
  })
}

export default pluginRegister
