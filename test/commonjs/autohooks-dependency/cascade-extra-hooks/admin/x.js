'use strict'

async function x (app) {
  app.get('/x', async () => ({ x: 'protected' }))
}
x[Symbol.for('plugin-meta')] = { name: 'admin-x', dependencies: ['admin-sub-y'] }

module.exports = x
