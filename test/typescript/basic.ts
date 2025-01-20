import test, { describe, before, after } from 'node:test'
import assert from 'node:assert'
import fastify from 'fastify'

import basicApp from './basic/app'

describe('typescript/basic test suite', function () {
  const app = fastify()
  before(async function () {
    app.register(basicApp)
    await app.ready()
  })

  after(async function () {
    await app.close()
  })

  test('should respond correctly to /javascript', async function () {
    const res = await app.inject({ url: '/javascript' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { script: 'java' })
  })

  test('should respond correctly to /typescript', async function () {
    const res = await app.inject({ url: '/typescript' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { script: 'type' })
  })
})
