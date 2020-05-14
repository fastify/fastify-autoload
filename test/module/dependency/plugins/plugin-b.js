import fp from 'fastify-plugin'

function plugin (f, opts, next) {
  if (!f.pluginE || !f.pluginF) {
    return next()
  }

  f.get('/plugin-b', (request, reply) => {
    reply.send({ data: 'plugin-b' })
  })

  f.decorate('pluginB', true)

  next()
}

export default fp(plugin, {
  name: 'plugin-b',
  dependencies: ['plugin-e']
})
