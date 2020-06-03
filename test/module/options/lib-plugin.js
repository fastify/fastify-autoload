import fp from 'fastify-plugin'

function plugin (f, opts, next) {
  const { name = 'default' } = opts
  f.get('/plugin-' + name, (request, reply) => {
    reply.send({ data: name })
  })

  next()
}

export default fp(plugin, { name: 'lib-plugin' })
