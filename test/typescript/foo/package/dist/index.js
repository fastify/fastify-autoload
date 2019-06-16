'use strict'
var answer1 = require('./answer')
var TSPlugin = function (f, opts, next) {
  f.get('/answer', function (request, reply) {
    reply.send({ answer: answer1.DeepThought.getAnswer() })
  })
  next()
}
module.exports = TSPlugin
