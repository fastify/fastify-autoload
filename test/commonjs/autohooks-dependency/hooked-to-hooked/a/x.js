'use strict'

async function x (app) {
  app.get('/x', async () => ({ x: true }))
}
x[Symbol.for('plugin-meta')] = { name: 'a-x', dependencies: ['b-y'] }

module.exports = x
