export default async function (app, opts) {
  app.get('/', async function (req, reply) {
    return { hooked: req.hooked }
  })
}
