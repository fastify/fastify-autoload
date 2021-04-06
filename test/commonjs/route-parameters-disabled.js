'use strict'

const t = require('tap')
const Fastify = require('fastify')

t.plan(9)

const app = Fastify()

app.register(require('./route-parameters/disabled'))

app.ready(function (err) {
  t.error(err)

  app.inject({
    url: '/users'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { users: [{ id: 7, username: 'example' }] })
  })

  app.inject({
    url: '/users/7'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 404)
  })

  app.inject({
    url: '/users/_id'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { user: { id: 'null', username: 'example' } })
  })
})
