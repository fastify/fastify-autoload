import fp from 'fastify-plugin'

function plugin (f, opts, next) {
  if (!f.pluginF) {
    return next()
  }

  f.get('/plugin-e', (request, reply) => {
    reply.send({ data: 'plugin-e' })
  })

  f.decorate('pluginE', true)

  next()
}

export default fp(plugin, {
  name: 'plugin-e',
  dependencies: ['plugin-f']
})
