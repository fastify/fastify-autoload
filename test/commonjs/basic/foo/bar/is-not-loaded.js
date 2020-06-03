'use strict'

module.exports = function (app, opts, next) {
  next(new Error('should not be loaded'))
}
