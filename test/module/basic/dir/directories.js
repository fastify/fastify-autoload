export default function (f, opts, next) {
  f.get('/dir', (request, reply) => {
    reply.send({ ecto: 'ries' })
  })

  next()
}
