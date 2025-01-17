'use strict'

const { after, before, describe, it } = require('node:test')
const assert = require('node:assert')
const Fastify = require('fastify')

describe('Node test suite for autohooks-disabled', function () {
  const app = Fastify()
  before(async function () {
    app.register(require('./autohooks/disabled'))
    app.decorateRequest('hooked', 'disabled')
    await app.ready()
  })

  after(async function () {
    await app.close()
  })

  it('should respond correctly to /', async function () {
    const res = await app.inject({ url: '/' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { hooked: 'disabled' })
  })

  it('should respond correctly to /child', async function () {
    const res = await app.inject({ url: '/child' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { hooked: 'disabled' })
  })

  it('should respond correctly to /child/grandchild', async function () {
    const res = await app.inject({ url: '/child/grandchild' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { hooked: 'disabled' })
  })

  it('should respond correctly to /sibling', async function () {
    const res = await app.inject({ url: '/sibling' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { hooked: 'disabled' })
  })
})
