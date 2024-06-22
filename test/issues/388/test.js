'use strict'

const t = require('tap')
const path = require('node:path')
const Fastify = require('fastify')
const autoLoad = require('../../../')

t.plan(7)

const app = Fastify()

app.register(autoLoad, {
  dir: path.join(__dirname, 'routes')
})

app.ready(function (err) {
  t.error(err)

  app.inject({
    url: '/'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 404)
  })
})

const app2 = Fastify()

app2.register(autoLoad, {
  dir: path.join(__dirname, 'routes'),
  scriptPattern: /(js|ts|tsx)$/
})

app2.ready(function (err) {
  t.error(err)

  app2.inject({
    url: '/'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(res.json(), { tsx: 'ok' })
  })
})
