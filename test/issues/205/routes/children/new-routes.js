'use strict'

module.exports = async function (app) {
  app.get('/entity', async () => ({ ok: true }))
}

module.exports.autoPrefix = '/batch'
