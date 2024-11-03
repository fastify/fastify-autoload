export default async function (app, opts) {
  app.addHook('onRequest', async (req, reply) => {
    req.hooked = req.hooked || []
    req.hooked.push('grandchild')
  })
}
