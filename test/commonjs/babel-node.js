'use strict'

const t = require('tap')
const Fastify = require('fastify')
const AutoLoad = require('../../')
const { join } = require('node:path')

t.plan(7)

const app = Fastify()

app.register(AutoLoad, {
  dir: join(__dirname, 'babel-node/routes')
})

app.ready(function (err) {
  t.error(err)

  app.inject({
    url: '/'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { hello: 'world' })
  })

  app.inject({
    url: '/foo'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { foo: 'bar' })
  })
})
