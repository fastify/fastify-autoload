'use strict'

module.exports = function (f, opts, next) {
  f.get('/skip', (request, reply) => {
    reply.send('skip')
  })

  next()
}

module.exports.autoload = false
