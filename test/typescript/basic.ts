import * as t from 'tap'
import fastify from 'fastify'

import basicApp from './basic/app'

t.plan(7)

const app = fastify()

app.register(basicApp)

app.ready(function (err): void {
  t.error(err)

  app.inject({
    url: '/javascript'
  }, function (err, res): void {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.deepEqual(JSON.parse(res.payload), { script: 'java' })
  })

  app.inject({
    url: '/typescript'
  }, function (err, res): void {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.deepEqual(JSON.parse(res.payload), { script: 'type' })
  })
})
