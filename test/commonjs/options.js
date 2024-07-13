'use strict'

const t = require('tap')
const Fastify = require('fastify')

t.plan(22)

const app = Fastify()

app.decorate('root', 'root')

app.register(require('./options/app'))

app.ready(function (err) {
  t.error(err)

  app.inject({
    url: '/plugin-a'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    // a is overriden by global option:
    t.same(JSON.parse(res.payload), { data: 'test-1' })
  })

  app.inject({
    url: '/plugin-b'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { data: 'override' })
  })

  app.inject({
    url: '/plugin-default'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { data: 'default' })
  })

  app.inject({
    url: '/plugin-c'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { data: 'c' })
  })

  app.inject({
    url: '/plugin-d'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { data: 'test-3' })
  })

  app.inject({
    url: '/plugin-e'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { data: 'test-4-root' })
  })

  app.inject({
    url: '/plugin-y'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { data: 'y' })
  })
})
