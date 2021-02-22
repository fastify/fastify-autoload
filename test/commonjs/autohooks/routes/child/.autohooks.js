module.exports = async function (app, opts, next) {
  app.addHook('onRequest', async (req, reply) => {
    req.hooked = req.hooked || []
    req.hooked.push('child')
    next()
  })
}
