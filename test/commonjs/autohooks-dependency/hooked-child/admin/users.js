'use strict'

async function users (app) {
  app.get('/users', async () => ({ users: 'protected' }))
}
users[Symbol.for('plugin-meta')] = { name: 'admin-users' }

module.exports = users
