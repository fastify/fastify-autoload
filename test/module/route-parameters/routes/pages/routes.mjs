export default async function (app, opts) {
  app.get('/', async function (req, reply) {
    return { route: '/pages' }
  })

  app.get('/archived', async function (req, reply) {
    return { route: '/pages/archived', id: req.params.id } // should be null
  })
}
