'use strict'

module.exports = function (f, opts, next) {
  f.get('/javascript', (request, reply) => {
    reply.send({ script: 'java' })
  })

  next()
}
