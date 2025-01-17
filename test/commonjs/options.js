'use strict'

const { after, before, describe, it } = require('node:test')
const assert = require('node:assert')
const Fastify = require('fastify')

describe('Node test suite for options', function () {
  const app = Fastify()

  before(async function () {
    app.decorate('root', 'root')
    app.register(require('./options/app'))
    await app.ready()
  })

  after(async function () {
    await app.close()
  })

  it('should respond correctly to /plugin-a with global option override', async function () {
    const res = await app.inject({ url: '/plugin-a' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { data: 'test-1' })
  })

  it('should respond correctly to /plugin-b', async function () {
    const res = await app.inject({ url: '/plugin-b' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { data: 'override' })
  })

  it('should respond correctly to /plugin-default', async function () {
    const res = await app.inject({ url: '/plugin-default' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { data: 'default' })
  })

  it('should respond correctly to /plugin-c', async function () {
    const res = await app.inject({ url: '/plugin-c' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { data: 'c' })
  })

  it('should respond correctly to /plugin-d', async function () {
    const res = await app.inject({ url: '/plugin-d' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { data: 'test-3' })
  })

  it('should respond correctly to /plugin-e', async function () {
    const res = await app.inject({ url: '/plugin-e' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { data: 'test-4-root' })
  })

  it('should respond correctly to /plugin-y', async function () {
    const res = await app.inject({ url: '/plugin-y' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { data: 'y' })
  })
})
