'use strict'

const t = require('tap')
const Fastify = require('fastify')

t.plan(13)

const app = Fastify()

app.register(require('./autohooks/disabled'))
app.decorateRequest('hooked', 'disabled')

app.ready(function (err) {
  t.error(err)

  app.inject({
    url: '/'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { hooked: 'disabled' })
  })

  app.inject({
    url: '/child'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { hooked: 'disabled' })
  })

  app.inject({
    url: '/child/grandchild'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { hooked: 'disabled' })
  })

  app.inject({
    url: '/sibling'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { hooked: 'disabled' })
  })
})
