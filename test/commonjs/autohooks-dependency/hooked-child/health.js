'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function () {}, {
  name: 'health',
  dependencies: ['admin-users']
})
