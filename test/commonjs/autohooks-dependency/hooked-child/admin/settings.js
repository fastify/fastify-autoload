'use strict'

module.exports = async function (app) {
  app.get('/', async () => ({ settings: 'protected' }))
}
module.exports.autoPrefix = '/admin-settings'
