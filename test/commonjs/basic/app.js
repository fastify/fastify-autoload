'use strict'

const fs = require('fs')
const path = require('path')
const autoLoad = require('../../../')

module.exports = function (fastify, opts, next) {
  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'foo'),
    options: { foo: 'bar' },
    ignorePattern: /^ignored/
  })

  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'defaultPrefix'),
    options: { prefix: '/defaultPrefix' }
  })

  const skipDir = path.join(__dirname, 'skip')
  fs.mkdir(path.join(skipDir, 'empty'), () => {
    fastify.register(autoLoad, {
      dir: skipDir
    })

    next()
  })
}
