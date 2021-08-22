'use strict'

const t = require('tap')
const fastify = require('fastify')

t.plan(4)

const app = fastify()

app.register(require('./index-package/app'))

app.ready(err => {
  t.error(err)

  app.inject({
    url: '/foo/bar'
  }, (err, res) => {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(res.json(), { success: true })
  })
})
