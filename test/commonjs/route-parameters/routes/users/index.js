module.exports = async function (app, opts, next) {
  app.get('/', async function (req, reply) {
    reply.status(200).send({ users: [{ id: 7, username: 'example' }] })
  })
}
