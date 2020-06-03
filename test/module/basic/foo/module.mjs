export default function (f, opts, next) {
  f.get('/module', (request, reply) => {
    reply.send(opts)
  })

  next()
}
