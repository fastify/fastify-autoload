'use strict'

module.exports = async function (app) {
  app.get('/alive', async function () {
    return { ok: true }
  })
}
