'use strict'

const path = require('path')
const AutoLoad = require('../../../')

module.exports = function (fastify, opts, next) {
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'lib')
  })

  next()
}
