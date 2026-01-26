'use strict'

const { test: testRunner } = require('node:test')
const assert = require('node:assert/strict')
const fastify = require('fastify')
const basicApp = require('./basic/app.ts')

testRunner('integration test with fastify autoload', async (t: any) => {
  const app = fastify()
  app.register(basicApp)

  await app.ready()

  await t.test('should return javascript data', async () => {
    const res = await app.inject({
      url: '/javascript',
    })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { script: 'java' })
  })

  await t.test('should return typescript data', async () => {
    const res = await app.inject({
      url: '/typescript',
    })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { script: 'type' })
  })

  await app.close()
})
