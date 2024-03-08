'use strict'

const path = require('node:path')
const autoLoad = require('../../..')

module.exports = function (fastify, opts, next) {
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

  const plugin = function (fastify, opts, next) {
    fastify.setNotFoundHandler(() => {
      console.count('setNotFoundHandler sibling')
      throw new Error('foo')
    })

    next()
  }

  fastify.register(function (fastify, opts, next) {
    fastify.get('/', () => {})

    fastify.register(plugin, { prefix: 'foo' })

    next()
  })

  next()
}
