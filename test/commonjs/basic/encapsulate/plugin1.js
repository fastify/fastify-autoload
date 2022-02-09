module.exports = (fastify, opts, done) => {
  fastify.decorateRequest('sharedVar', '')

  fastify.addHook('onRequest', (request, reply, done) => {
    fastify.sharedVar = true
    done()
  })

  done()
}
