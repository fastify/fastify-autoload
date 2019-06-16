'use strict'
var answer1 = require('./deep-thought')
var TSPlugin = function (f, opts, next) {
  f.get('/package', function (request, reply) {
    reply.send({ answer: answer1.DeepThought.getAnswer() })
  })
  next()
}
module.exports = TSPlugin
