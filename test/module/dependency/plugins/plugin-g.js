import fp from 'fastify-plugin'

function plugin (f, opts, next) {
  f.get('/plugin-g', (request, reply) => {
    const data = request.urlData()

    reply.send(data)
  })

  next()
}

export default fp(plugin, {
  name: 'plugin-g',
  dependencies: ['@fastify/url-data']
})
