import { after, before, describe, it } from 'node:test'
import assert from 'node:assert'
import fastify from 'fastify'
import basicApp from './basic/app.js'

describe('basic tests', function () {
  const app = fastify()

  before(async function () {
    app.register(basicApp)
    await app.ready()
  })

  after(async function () {
    await app.close()
  })

  it('should respond correctly to /something', async function () {
    const res = await app.inject({ url: '/something' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { something: 'else' })
  })

  it('should respond correctly to /autoroute/items/1', async function () {
    const res = await app.inject({ url: '/autoroute/items/1' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { answer: 42 })
  })

  it('should respond correctly to /autoroute/items', async function () {
    const res = await app.inject({ url: '/autoroute/items' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), [
      { answer: 42 },
      { answer: 41 },
    ])
  })

  it('should respond correctly to /autowrap/1', async function () {
    const res = await app.inject({ url: '/autowrap/1' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { answer: 42 })
  })

  it('should respond correctly to /autowrap', async function () {
    const res = await app.inject({ url: '/autowrap' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), [
      { answer: 42 },
      { answer: 41 },
    ])
  })

  it('should respond correctly to /semiautomatic/items/1', async function () {
    const res = await app.inject({ url: '/semiautomatic/items/1' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { answer: 42 })
  })

  it('should respond correctly to /semiautomatic/items', async function () {
    const res = await app.inject({ url: '/semiautomatic/items' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), [
      { answer: 42 },
      { answer: 41 },
    ])
  })

  it('should respond correctly to /bar', async function () {
    const res = await app.inject({ url: '/bar' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { foo: 'bar' })
  })

  it('should respond correctly to /prefixed', async function () {
    const res = await app.inject({ url: '/prefixed' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { something: 'else' })
  })

  it('should respond correctly to /skip', async function () {
    const res = await app.inject({ url: '/skip' })
    assert.strictEqual(res.statusCode, 404)
  })

  it('should respond correctly to /options', async function () {
    const res = await app.inject({ url: '/options' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { foo: 'bar' })
  })

  it('should respond correctly to /commonjs', async function () {
    const res = await app.inject({ url: '/commonjs' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { foo: 'bar' })
  })

  it('should respond correctly to /module', async function () {
    const res = await app.inject({ url: '/module' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { foo: 'bar' })
  })

  it('should respond correctly to /defaultPrefix', async function () {
    const res = await app.inject({ url: '/defaultPrefix' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { index: true })
  })

  it('should respond correctly to /defaultPrefix/prefixed', async function () {
    const res = await app.inject({ url: '/defaultPrefix/prefixed' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { prefixed: true })
  })

  it('should respond correctly to /defaultPrefix/overriddenPrefix', async function () {
    const res = await app.inject({ url: '/defaultPrefix/overriddenPrefix' })
    assert.strictEqual(res.statusCode, 404)
  })

  it('should respond correctly to /overriddenPrefix', async function () {
    const res = await app.inject({ url: '/overriddenPrefix' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { overide: 'prefix' })
  })

  it('should respond correctly to /noPrefix', async function () {
    const res = await app.inject({ url: '/noPrefix' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { no: 'prefix' })
  })

  it('should respond correctly to /one/', async function () {
    const res = await app.inject({ url: '/one/' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { works: true })
  })

  it('should respond correctly to /one/two/three', async function () {
    const res = await app.inject({ url: '/one/two/three' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { works: true })
  })

  it('should respond correctly to /ten/', async function () {
    const res = await app.inject({ url: '/ten/' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { works: true })
  })

  it('should respond correctly to /ten/eight', async function () {
    const res = await app.inject({ url: '/ten/eight' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { works: true })
  })

  it('should respond correctly to /nested/shallow', async function () {
    const res = await app.inject({ url: '/nested/shallow' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { works: true })
  })

  it('should respond correctly to /nested/shallow/deep', async function () {
    const res = await app.inject({ url: '/nested/shallow/deep' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { works: true })
  })

  it('should respond correctly to /nested/shallow/deep/deeper', async function () {
    const res = await app.inject({ url: '/nested/shallow/deep/deeper' })
    assert.strictEqual(res.statusCode, 404)
    assert.deepStrictEqual(JSON.parse(res.payload), {
      message: 'Route GET:/nested/shallow/deep/deeper not found',
      error: 'Not Found',
      statusCode: 404,
    })
  })

  it('should respond correctly to /configPrefix', async function () {
    const res = await app.inject({ url: '/configPrefix' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { configPrefix: true })
  })

  it('should respond correctly to /configPrefixCallback', async function () {
    const res = await app.inject({ url: '/configPrefixCallback' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), {
      configPrefixCallback: true,
    })
  })
})
