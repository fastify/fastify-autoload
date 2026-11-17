'use strict'

async function secret (app) {
  app.get('/secret', async () => ({ secret: 'protected' }))
}
secret[Symbol.for('plugin-meta')] = { name: 'root-secret' }

module.exports = secret
