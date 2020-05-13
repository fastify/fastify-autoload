'use strict'

export default function (f, opts, next) {
  f.get('/foo/bar', (request, reply) => {
    reply.send({ foo: 'bar' })
  })

  next()
}
