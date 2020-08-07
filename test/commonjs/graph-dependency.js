'use strict'

const t = require('tap')
const Fastify = require('fastify')

t.plan(9)

const app = Fastify()

app.register(require('./graph-dependency/app'))

app.ready(function (err) {
  t.error(err)

  app.inject({
    url: '/a'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
  })

  app.inject({
    url: '/b'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
  })

  app.inject({
    url: '/c'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
  })

  app.inject({
    url: '/d'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
  })
})
