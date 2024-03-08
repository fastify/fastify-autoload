'use strict'

const path = require('node:path')
const autoLoad = require('../../..')

module.exports = async function (fastify) {
  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'not-found-handler/routes-a'),
    autoHooks: true,
    cascadeHooks: true,
    options: { foo: 'bar' }
  })

  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'not-found-handler/routes-b'),
    autoHooks: true,
    cascadeHooks: true,
    options: { foo: 'bar', prefix: 'custom-prefix' }
  })
}
