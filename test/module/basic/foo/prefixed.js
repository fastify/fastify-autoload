export default function (f, opts, next) {
  f.get('/', (request, reply) => {
    reply.send({ something: 'else' })
  })

  next()
}

export const autoPrefix = '/prefixed'
