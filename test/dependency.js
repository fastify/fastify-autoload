'use strict'

const t = require('tap')
const Fastify = require('fastify')

t.plan(19)

const app = Fastify()

app.register(require('./basic/app'))

app.ready(function (err) {
  t.error(err)

  app.inject({
    url: '/plugin-a'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.deepEqual(JSON.parse(res.payload), { data: 'plugin-a' })
  })

  app.inject({
    url: '/plugin-b'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.deepEqual(JSON.parse(res.payload), { data: 'plugin-b' })
  })

  app.inject({
    url: '/plugin-c'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.deepEqual(JSON.parse(res.payload), { data: 'plugin-c' })
  })

  app.inject({
    url: '/plugin-d'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.deepEqual(JSON.parse(res.payload), { data: 'plugin-d' })
  })

  app.inject({
    url: '/plugin-e'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.deepEqual(JSON.parse(res.payload), { data: 'plugin-e' })
  })

  app.inject({
    url: '/plugin-f'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.deepEqual(JSON.parse(res.payload), { data: 'plugin-f' })
  })
})
