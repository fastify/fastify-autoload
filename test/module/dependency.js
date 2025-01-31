import { after, before, describe, it } from 'node:test'
import assert from 'node:assert'
import fastify from 'fastify'
import dependencyApp from './dependency/app.js'

describe('dependency tests', function () {
  const app = fastify()

  before(async function () {
    app.register(dependencyApp)
    await app.ready()
  })

  after(async function () {
    await app.close()
  })

  it('should respond correctly to /plugin-a', async function () {
    const res = await app.inject({ url: '/plugin-a' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { data: 'plugin-a' })
  })

  it('should respond correctly to /plugin-b', async function () {
    const res = await app.inject({ url: '/plugin-b' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { data: 'plugin-b' })
  })

  it('should respond correctly to /plugin-c', async function () {
    const res = await app.inject({ url: '/plugin-c' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { data: 'plugin-c' })
  })

  it('should respond correctly to /plugin-d', async function () {
    const res = await app.inject({ url: '/plugin-d' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { data: 'plugin-d' })
  })

  it('should respond correctly to /plugin-e', async function () {
    const res = await app.inject({ url: '/plugin-e' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { data: 'plugin-e' })
  })

  it('should respond correctly to /plugin-f', async function () {
    const res = await app.inject({ url: '/plugin-f' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { data: 'plugin-f' })
  })

  it('should respond correctly to /plugin-g', async function () {
    const res = await app.inject({ url: '/plugin-g' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload).path, '/plugin-g')
  })
})
