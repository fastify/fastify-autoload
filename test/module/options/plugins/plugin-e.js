import fp from 'fastify-plugin'

function plugin (f, opts, next) {
  f.get('/plugin-e', (request, reply) => {
    reply.send({ data: opts.e })
  })

  next()
}

export default fp(plugin, { name: 'plugin-e' })
export const autoConfig = (fastify) => {
  return { e: 'test-4-' + fastify.root }
}
