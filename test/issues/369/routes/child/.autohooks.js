'use strict'

module.exports = async function (app) {
  app.addHook('onRequest', async (req) => {
    req.hooked = req.hooked || []
    req.hooked.push('child')
  })
}
