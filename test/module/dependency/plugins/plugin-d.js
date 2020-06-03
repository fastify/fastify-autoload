import fp from 'fastify-plugin'

function plugin (f, opts, next) {
  if (!f.pluginE || !f.pluginF) {
    return next()
  }

  f.get('/plugin-d', (request, reply) => {
    reply.send({ data: 'plugin-d' })
  })

  f.decorate('pluginD', true)

  next()
}

export default fp(plugin, {
  name: 'plugin-d',
  dependencies: ['plugin-e']
})
