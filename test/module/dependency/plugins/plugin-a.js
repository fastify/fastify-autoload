import fp from 'fastify-plugin'

function plugin (f, opts, next) {
  if (!f.pluginD || !f.pluginE || !f.pluginF) {
    return next()
  }

  f.get('/plugin-a', (request, reply) => {
    reply.send({ data: 'plugin-a' })
  })

  f.decorate('pluginA', true)

  next()
}

export default fp(plugin, {
  name: 'plugin-a',
  dependencies: ['plugin-d']
})
