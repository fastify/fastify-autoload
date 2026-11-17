'use strict'

async function y (app) {
  app.get('/y', async (req) => ({ y: 'protected', role: req.headers['x-role'] }))
}
y[Symbol.for('plugin-meta')] = { name: 'admin-sub-y' }

module.exports = y
