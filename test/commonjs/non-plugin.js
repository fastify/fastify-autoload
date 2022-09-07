'use strict'

// This test tests that automatic loading will skip modules that do not
// export a function, i.e. not a fastify plugin.

const t = require('tap')
const fastify = require('fastify')

t.plan(4)

const app = fastify()

app.register(require('./non-plugin/app'))

app.ready(err => {
  t.error(err)

  app.inject({
    url: '/foo'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(res.payload, 'foo')
  })
})
