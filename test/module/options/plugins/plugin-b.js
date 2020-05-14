import fp from 'fastify-plugin'

function plugin (f, opts, next) {
  f.get('/plugin-b', (request, reply) => {
    reply.send({ data: opts.b })
  })

  next()
}

export default fp(plugin, { name: 'plugin-b' })
export const autoConfig = { b: 'test-2' }
