'use strict'

const { after, before, describe, it } = require('node:test')
const assert = require('node:assert')
const Fastify = require('fastify')

describe('Node test suite for deep routes', function () {
  const app = Fastify()

  before(async function () {
    app.register(require('./deep/app'))
    await app.ready()
  })

  after(async function () {
    await app.close()
  })

  it('should respond correctly to /with-dirs/level-1/level-2/deep-route', async function () {
    const res = await app.inject({
      url: '/with-dirs/level-1/level-2/deep-route'
    })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { data: 'deep-route' })
  })

  it('should respond correctly to /without-dirs/deep-route', async function () {
    const res = await app.inject({
      url: '/without-dirs/deep-route'
    })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { data: 'deep-route' })
  })
})
