module.exports = async function (app, opts, next) {
  app.setNotFoundHandler(() => {
    throw new Error("foo");
  });

  app.addHook('onRequest', async (req, reply) => {
    req.hooked = req.hooked || []
    req.hooked.push('child')
  })
}
