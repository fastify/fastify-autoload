'use strict'

const t = require('tap')
const fastify = require('fastify')
const semver = require('semver')

const moduleSupport = semver.satisfies(process.version, '>= 14 || >= 12.17.0 < 13.0.0')

t.test('independent of module support', function (t) {
  t.plan(8)
  const app = fastify()

  app.register(require('./syntax-error/app'))

  app.ready(function (err) {
    t.type(err, SyntaxError)
    t.match(err.message, /unexpected token/i)
  })

  const app2 = fastify()

  app2.register(require('./index-error/app'))

  app2.ready(function (err) {
    t.type(err, Error)
    t.match(err.message, /cannot import plugin.*index/i)
  })

  const app3 = fastify()

  app3.register(require('./ts-error/app'))

  app3.ready(function (err) {
    t.type(err, Error)
    t.match(err.message, /cannot import plugin.*typescript/i)
  })

  const app4 = fastify()

  app4.register(require('./cyclic-dependency/app'))

  app4.ready(function (err) {
    t.type(err, Error)
    t.equal(err.message, 'Cyclic dependency')
  })
})

if (!moduleSupport) {
  t.test('without moduleSupport', function (t) {
    t.plan(2)
    const app = fastify()

    app.register(require('./module-error/app'))

    app.ready(function (err) {
      t.type(err, Error)
      t.match(err.message, /cannot import plugin at .*mjs/i)
    })
  })
}
