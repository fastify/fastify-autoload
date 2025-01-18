'use strict'

const t = require('tap')
const path = require('node:path')
const Fastify = require('fastify')
const autoLoad = require('../../../')

t.plan(13)

const app = Fastify()

app.register(autoLoad, {
  dir: path.join(__dirname, 'routes'),
  autoHooks: true,
  options: { prefix: '/api' }
})

app.register(autoLoad, {
  dir: path.join(__dirname, 'routes'),
  autoHooks: true,
  options: { prefix: '/prefix/' }
})

app.ready(function (err) {
  t.error(err)

  app.inject({
    url: '/api'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(res.json(), { path: '/api' })
  })

  app.inject({
    url: '/api/entity'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(res.json(), { path: '/api/entity', hooked: ['root'] })
  })

  app.inject({
    url: '/prefix'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(res.json(), { path: '/prefix' })
  })

  app.inject({
    url: '/prefix/entity'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(res.json(), { path: '/prefix/entity', hooked: ['root'] })
  })
})
