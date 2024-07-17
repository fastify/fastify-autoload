'use strict'

module.exports = async function (app, opts) {
  app.get('/', async function (req, reply) {
    reply.status(200).send({ user: { id: req.params.id || 'null', username: 'example' } }) // explicit null reply to preserve response body
  })
}
