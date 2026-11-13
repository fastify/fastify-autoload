'use strict'

async function b (app) {
  app.get('/b', async () => ({ b: 'protected' }))
}
b[Symbol.for('plugin-meta')] = { name: 'admin-b' }

module.exports = b
