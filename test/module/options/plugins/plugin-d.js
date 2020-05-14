import fp from 'fastify-plugin'

function plugin (f, opts, next) {
  f.get('/plugin-d', (request, reply) => {
    reply.send({ data: opts.d })
  })

  next()
}

export default fp(plugin, { name: 'plugin-d' })
export const autoConfig = { d: 'test-3' }
