const pluginRegister = async (fastify) => {
  fastify.addHook('onRequest', async (request) => {
    request.hooksUsed.push('second')
  })
}

export default pluginRegister
