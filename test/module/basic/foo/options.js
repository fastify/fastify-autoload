export default function (f, opts, next) {
  f.get('/options', (request, reply) => {
    reply.send(opts)
  })

  next()
}
