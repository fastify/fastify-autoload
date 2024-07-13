'use strict'

const t = require('tap')
const path = require('node:path')
const Fastify = require('fastify')
const autoLoad = require('../../../')

t.plan(10)

const app = Fastify()

app.register(autoLoad, {
  dir: path.join(__dirname, 'routes'),
  autoHooks: true,
  cascadeHooks: true,
  routeParams: true
})

app.ready(function (err) {
  t.error(err)

  app.inject({
    url: '/'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(res.json(), { path: '/' })
  })

  app.inject({
    url: '/entity'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(res.json(), { path: '/entity', hooked: ['root'] })
  })

  app.inject({
    url: '/entity/1'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(res.json(), { path: '/entity/1', hooked: ['root'], params: { entity: 1 } })
  })
})
