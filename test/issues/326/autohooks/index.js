'use strict'

const path = require('node:path')
const autoLoad = require('../../../../')

module.exports = async function (fastify) {
  fastify.register(autoLoad, {
    dir: path.join(__dirname, '/routes-a'),
    autoHooks: true,
    cascadeHooks: true
  })

  fastify.register(autoLoad, {
    dir: path.join(__dirname, '/routes-b'),
    autoHooks: true,
    cascadeHooks: true,
    options: { prefix: 'custom-prefix' }
  })
}
