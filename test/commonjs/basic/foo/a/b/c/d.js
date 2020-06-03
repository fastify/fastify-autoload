'use strict'

module.exports = function (app, opts, next) {
  console.log(app.prefix)
  app.get('/', (req, reply) => { reply.send('d') })
  next()
}
