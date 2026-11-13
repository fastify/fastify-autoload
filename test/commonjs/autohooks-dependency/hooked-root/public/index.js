'use strict'

async function publicRoutes (app) {
  app.get('/', async () => ({ public: true }))
}
publicRoutes[Symbol.for('plugin-meta')] = { name: 'public', dependencies: ['root-secret'] }

module.exports = publicRoutes
