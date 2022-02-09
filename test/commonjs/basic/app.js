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
    dir: path.join(__dirname, 'index-pattern'),
    options: { prefix: '/custom-index' },
    indexPattern: /.custom\.js$/,
    ignorePattern: /^index/
  })

  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'rewrite-route-prefix'),
    options: { prefix: '/rewrite-route-prefix' },
    dirNameRoutePrefix: function rewrite (folderParent, folderName) {
      switch (folderName) {
        case 'two': // called twice
          return false
        case 'three':
          return 'tre'
        case 'empty':
          return folderName
        default:
          throw new Error('rewrite called too much times')
      }
    }
  })

  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'defaultPrefix'),
    options: { prefix: '/defaultPrefix' }
  })

  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'one'),
    options: { prefix: 'one/' }
  })

  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'index'),
    options: { prefix: 'index/' }
  })

  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'routeParams'),
    options: { prefix: 'routeParams/' },
    routeParams: true
  })

  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'encapsulate'),
    encapsulate: false
  })

  const skipDir = path.join(__dirname, 'skip')
  fs.mkdir(path.join(skipDir, 'empty'), () => {
    fastify.register(autoLoad, {
      dir: skipDir
    })

    next()
  })
}

module.exports[Symbol.for('skip-override')] = true
