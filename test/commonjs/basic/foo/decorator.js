'use strict'

module.exports = function (f, opts, next) {
  f.decorate('foo', 'bar')

  next()
}

module.exports[Symbol.for('skip-override')] = true
