'use strict'

const { after, before, describe, it } = require('node:test')
const assert = require('node:assert')
const Fastify = require('fastify')

describe('Node test suite for basic', function () {
  const app = Fastify()

  before(async function () {
    app.register(require('./basic/app'))
    await app.ready()
  })

  after(async function () {
    await app.close()
  })

  it('should set app.foo correctly', function () {
    assert.strictEqual(app.foo, 'bar')
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
    assert.deepStrictEqual(JSON.parse(res.payload), [{ answer: 42 }, { answer: 41 }])
  })

  it('should respond correctly to /autowrap/1', async function () {
    const res = await app.inject({ url: '/autowrap/1' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { answer: 42 })
  })

  it('should respond correctly to /autowrap', async function () {
    const res = await app.inject({ url: '/autowrap' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), [{ answer: 42 }, { answer: 41 }])
  })

  it('should respond correctly to /semiautomatic/items/1', async function () {
    const res = await app.inject({ url: '/semiautomatic/items/1' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { answer: 42 })
  })

  it('should respond correctly to /semiautomatic/items', async function () {
    const res = await app.inject({ url: '/semiautomatic/items' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), [{ answer: 42 }, { answer: 41 }])
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

  it('should respond correctly to /default', async function () {
    const res = await app.inject({ url: '/default' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { exports: 'default' })
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

  it('should respond correctly to /a/b/c', async function () {
    const res = await app.inject({ url: '/a/b/c' })

    assert.strictEqual(res.statusCode, 200)
    assert.strictEqual(res.payload.toString(), 'd')
  })

  it('should respond correctly to /custom-index/', async function () {
    const res = await app.inject({ url: '/custom-index/' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { custom: true })
  })

  it('should respond correctly to /index/', async function () {
    const res = await app.inject({ url: '/index/' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { works: true })
  })

  it('should respond correctly to /index/bar/', async function () {
    const res = await app.inject({ url: '/index/bar/' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { works: true })
  })

  describe('rewrite-route-prefix variants', function () {
    const urls = [
      '/rewrite-route-prefix',
      '/rewrite-route-prefix/',
      '/rewrite-route-prefix/tre',
      '/rewrite-route-prefix/tre/',
      '/rewrite-route-prefix/tre/empty/'
    ]

    for (const url of urls) {
      it(`should respond correctly to ${url}`, async function () {
        const res = await app.inject({ url })

        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(JSON.parse(res.payload), { works: true })
      })
    }
  })

  it('should respond correctly to /index/ignored', async function () {
    const res = await app.inject({ url: '/index/ignored' })

    assert.strictEqual(res.statusCode, 404)
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

  it('should respond correctly to /routeParams', async function () {
    const res = await app.inject({ url: '/routeParams' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { works: true })
  })

  it('should respond correctly to /routeParams/foo', async function () {
    const res = await app.inject({ url: '/routeParams/foo' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { works: true })
  })

  it('should respond correctly to /routeParams/foo/1', async function () {
    const res = await app.inject({ url: '/routeParams/foo/1' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { works: true, id1: '1' })
  })

  it('should respond correctly to /routeParams/foo/abc/bar/2', async function () {
    const res = await app.inject({ url: '/routeParams/foo/abc/bar/2' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { works: true, id1: 'abc', id2: '2' })
  })

  it('should respond correctly to /encapsulate', async function () {
    const res = await app.inject({ url: '/encapsulate' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { works: true })
  })

  it('should respond correctly to /configPrefix', async function () {
    const res = await app.inject({ url: '/configPrefix' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { configPrefix: true })
  })

  it('should respond correctly to /configPrefixCallback', async function () {
    const res = await app.inject({ url: '/configPrefixCallback' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { configPrefixCallback: true })
  })
})
