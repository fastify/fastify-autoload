'use strict'

module.exports = new Promise((resolve) => {
  resolve(async function (app) {
    app.addHook('onRequest', async (req) => {
      req.hooked = req.hooked || []
      req.hooked.push('promisified')
    })
  })
})
