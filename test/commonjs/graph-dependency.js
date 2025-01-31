'use strict'

const { after, before, describe, it } = require('node:test')
const assert = require('node:assert')
const Fastify = require('fastify')

describe('Node test suite for graph dependency', function () {
  const app = Fastify()

  before(async function () {
    app.register(require('./graph-dependency/app'))
    await app.ready()
  })

  after(async function () {
    await app.close()
  })

  it('should respond correctly to /a', async function () {
    const res = await app.inject({ url: '/a' })

    assert.strictEqual(res.statusCode, 200)
  })

  it('should respond correctly to /b', async function () {
    const res = await app.inject({ url: '/b' })

    assert.strictEqual(res.statusCode, 200)
  })

  it('should respond correctly to /c', async function () {
    const res = await app.inject({ url: '/c' })

    assert.strictEqual(res.statusCode, 200)
  })

  it('should respond correctly to /d', async function () {
    const res = await app.inject({ url: '/d' })

    assert.strictEqual(res.statusCode, 200)
  })
})
