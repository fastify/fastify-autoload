export default async function (app) {
  app.get('/api', async function (req, reply) {
    reply.status(200).send({ path: req.url })
  })
}
