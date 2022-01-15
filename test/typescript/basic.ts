import t from 'tap'
import fastify from 'fastify'

import basicApp from './basic/app'

t.plan(5)

const app = fastify()

app.register(basicApp)

app.ready(async function (err): Promise<void> {
  t.error(err)

  await app.inject({
    url: '/javascript'
  }).then(function (res): void {
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { script: 'java' })
  }).catch((err) => {
    t.error(err)
  })

  await app.inject({
    url: '/typescript'
  }).then(function (res): void {
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { script: 'type' })
  }).catch((err) => {
    t.error(err)
  })
})
