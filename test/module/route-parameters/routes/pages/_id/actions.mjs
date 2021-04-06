export default async function (app, opts) {
  app.get('/', async function (req, reply) {
    return { route: '/pages/:id/', id: req.params.id }
  })

  app.get('/edit', async function (req, reply) {
    return { route: '/pages/:id/edit', id: req.params.id }
  })
}
