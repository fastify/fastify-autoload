import fp from 'fastify-plugin'

function plugin (f, opts, next) {
  if (!f.pluginE || !f.pluginF) {
    return next()
  }

  f.get('/plugin-c', (request, reply) => {
    reply.send({ data: 'plugin-c' })
  })

  f.decorate('pluginC', true)

  next()
}

export default fp(plugin, {
  name: 'plugin-c',
  dependencies: ['plugin-e']
})
