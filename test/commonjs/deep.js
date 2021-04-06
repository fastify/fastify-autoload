'use strict'

const t = require('tap')
const Fastify = require('fastify')

t.plan(7)

const app = Fastify()

app.register(require('./deep/app'))

app.ready(function (err) {
  t.error(err)

  app.inject({
    url: '/with-dirs/level-1/level-2/deep-route'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { data: 'deep-route' })
  })

  app.inject({
    url: '/without-dirs/deep-route'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { data: 'deep-route' })
  })
})
