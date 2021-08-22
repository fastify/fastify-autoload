export default function (f, opts, next) {
  f.get('/bar', (request, reply) => {
    reply.send({ success: true })
  })

  next()
}
