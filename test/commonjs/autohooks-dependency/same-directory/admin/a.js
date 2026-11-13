'use strict'

async function a (app) {
  app.get('/a', async () => ({ a: 'protected' }))
}
a[Symbol.for('plugin-meta')] = { name: 'admin-a', dependencies: ['admin-b'] }

module.exports = a
