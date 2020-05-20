'use strict'

const t = require('tap')
const Fastify = require('fastify')
const path = require('path')

t.plan(22)

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

  app.inject({
    url: '/deep/autoroute/items/1'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.deepEqual(JSON.parse(res.payload), { answer: 42 })
  })

  app.inject({
    url: '/deep/autoroute/items'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.deepEqual(JSON.parse(res.payload), [{ answer: 42 }, { answer: 41 }])
  })

  app.inject({
    url: '/deep/deeper/moreComplicatedDeep/items/1'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.deepEqual(JSON.parse(res.payload), { answer: 42 })
  })

  app.inject({
    url: '/deep/deeper/moreComplicatedDeep/items'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.deepEqual(JSON.parse(res.payload), [{ answer: 42 }, { answer: 41 }])
  })
})
