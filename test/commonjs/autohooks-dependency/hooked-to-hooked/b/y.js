'use strict'

async function y (app) {
  app.get('/y', async () => ({ y: 'protected' }))
}
y[Symbol.for('plugin-meta')] = { name: 'b-y' }

module.exports = y
