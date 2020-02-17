'use strict'

const t = require('tap')
const Fastify = require('fastify')
const { clean, satisfies } = require('semver')

if (satisfies(clean(process.version), '>=12')) {
  t.plan(16)

  const app = Fastify()

  app.register(require('./mjs/app'))

  app.ready(function (err) {
    t.error(err)

    app.inject({
      url: '/mjs'
    }, function (err, res) {
      t.error(err)
      t.equal(res.statusCode, 200)
      t.deepEqual(JSON.parse(res.payload), { hello: 'world' })
    })

    app.inject({
      url: '/mjs-fastify-plugin'
    }, function (err, res) {
      t.error(err)
      t.equal(res.statusCode, 200)
      t.deepEqual(JSON.parse(res.payload), { hello: 'world' })
    })

    app.inject({
      url: '/js-module'
    }, function (err, res) {
      t.error(err)
      t.equal(res.statusCode, 200)
      t.deepEqual(JSON.parse(res.payload), { hello: 'world' })
    })

    app.inject({
      url: '/subfolder/js-module-subfolder'
    }, function (err, res) {
      t.error(err)
      t.equal(res.statusCode, 200)
      t.deepEqual(JSON.parse(res.payload), { hello: 'world' })
    })

    app.inject({
      url: '/subfolder2/js-module-subfolder'
    }, function (err, res) {
      t.error(err)
      t.equal(res.statusCode, 200)
      t.deepEqual(JSON.parse(res.payload), { hello: 'world' })
    })
  })
}
