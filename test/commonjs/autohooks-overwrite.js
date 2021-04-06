'use strict'

const t = require('tap')
const Fastify = require('fastify')

t.plan(13)

const app = Fastify()

app.register(require('./autohooks/overwrite'))
app.decorateRequest('hooked', '')

app.ready(function (err) {
  t.error(err)

  app.inject({
    url: '/'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { hooked: ['root'] })
  })

  app.inject({
    url: '/child'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { hooked: ['child'] })
  })

  app.inject({
    url: '/child/grandchild'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { hooked: ['grandchild'] })
  })

  app.inject({
    url: '/sibling'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { hooked: ['root'] })
  })
})
