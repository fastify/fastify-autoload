'use strict'

const t = require('tap')
const Fastify = require('fastify')
const path = require('path')

t.plan(10)

const app = Fastify()

app.register(require('./recursive/app'), {
  dir: path.join(__dirname, 'recursive', 'foo')
})

app.ready(function (err) {
  t.error(err)

  app.inject({
    url: '/something'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.deepEqual(JSON.parse(res.payload), { something: 'else' })
  })

  app.inject({
    url: '/deep/indeep'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.deepEqual(JSON.parse(res.payload), { deeper: 'so deep' })
  })

  app.inject({
    url: '/deep/deeper/deepest'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.deepEqual(JSON.parse(res.payload), { deepest: 'the deepest' })
  })
})
