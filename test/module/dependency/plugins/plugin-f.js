import fp from 'fastify-plugin'

function plugin (f, opts, next) {
  f.get('/plugin-f', (request, reply) => {
    reply.send({ data: 'plugin-f' })
  })

  f.decorate('pluginF', true)

  next()
}

export default fp(plugin, {
  name: 'plugin-f'
})
