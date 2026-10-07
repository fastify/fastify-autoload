'use strict'

module.exports = async function (app) {
  app.get('/', async () => ({ loaded: true }))
}

module.exports.autoConfig = () => ({})
