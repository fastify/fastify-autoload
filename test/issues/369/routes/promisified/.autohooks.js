'use strict'

module.exports = new Promise((resolve) => {
  resolve(async function (app, opts) {
    app.addHook('onRequest', async (req, reply) => {
      req.hooked = req.hooked || []
      req.hooked.push('promisified')
    })
  })
})
