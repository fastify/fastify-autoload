'use strict'

const t = require('tap')
const Fastify = require('fastify')

t.plan(7)

const app = Fastify()

app.register(require('./options/app'))

app.ready(function (err) {
  t.error(err)

  app.inject({
    url: '/plugin-a'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    // a is overriden by global option:
    t.deepEqual(JSON.parse(res.payload), { data: 'test-1' })
  })

  app.inject({
    url: '/plugin-b'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.deepEqual(JSON.parse(res.payload), { data: 'override' })
  })
})
