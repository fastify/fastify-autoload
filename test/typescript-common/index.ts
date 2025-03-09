'use script'

const { test: t } = require('node:test')
const fastify = require('fastify')

const basicApp = require('./basic/app.ts')

t.plan(5)

const app = fastify()

app.register(basicApp)

app.ready(async function (err) {
  t.error(err)

  await app
    .inject({
      url: '/javascript',
    })
    .then(function (res: any) {
      t.equal(res.statusCode, 200)
      t.same(JSON.parse(res.payload), { script: 'java' })
    })
    .catch((err) => {
      t.error(err)
    })

  await app
    .inject({
      url: '/typescript',
    })
    .then(function (res: any) {
      t.equal(res.statusCode, 200)
      t.same(JSON.parse(res.payload), { script: 'type' })
    })
    .catch((err) => {
      t.error(err)
    })
})
