import fp from 'fastify-plugin'

function plugin (f, opts, next) {
  f.get('/plugin-a', (request, reply) => {
    reply.send({ data: opts.a })
  })

  next()
}

export default fp(plugin, { name: 'plugin-a' })
export const autoConfig = { a: 'test-1' }
