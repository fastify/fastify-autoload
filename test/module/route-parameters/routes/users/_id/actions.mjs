export default async function (app, opts) {
  app.get('/details', async function (req, reply) {
    return { route: '/users/:id/details', id: req.params.id }
  })
}
