import { after, before, describe, it } from 'node:test'
import assert from 'node:assert'
import fastify from 'fastify'
import routeParametersBasic from './route-parameters/basic.mjs'
import routeParametersDisabled from './route-parameters/disabled.mjs'

describe('routeParams: Default behaviour', function () {
  const app = fastify()

  before(async function () {
    app.register(routeParametersBasic)
    await app.ready()
  })

  after(async function () {
    await app.close()
  })

  it('should handle root route correctly', async function () {
    const res = await app.inject('/')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { route: '/' })
  })

  it('should handle /pages route correctly', async function () {
    const res = await app.inject('/pages')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { route: '/pages' })
  })

  it('should handle /pages/archived route correctly', async function () {
    const res = await app.inject('/pages/archived')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { route: '/pages/archived' })
  })

  it('should handle /pages/:id route correctly', async function () {
    const res = await app.inject('/pages/test_id')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { route: '/pages/:id/', id: 'test_id' })
  })

  it('should handle /pages/:id/edit route correctly', async function () {
    const res = await app.inject('/pages/test_id/edit')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), {
      route: '/pages/:id/edit',
      id: 'test_id',
    })
  })

  it('should handle /users/:id/details route correctly', async function () {
    const res = await app.inject('/users/test_id/details')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), {
      route: '/users/:id/details',
      id: 'test_id',
    })
  })
})

describe('routeParams: off', function () {
  const app = fastify()

  before(async function () {
    app.register(routeParametersDisabled)
    await app.ready()
  })

  after(async function () {
    await app.close()
  })

  it('should handle root route correctly', async function () {
    const res = await app.inject('/')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { route: '/' })
  })

  it('should handle /pages route correctly', async function () {
    const res = await app.inject('/pages')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { route: '/pages' })
  })

  it('should handle /pages/archived route correctly', async function () {
    const res = await app.inject('/pages/archived')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { route: '/pages/archived' })
  })

  it('should handle /pages/test_id route correctly', async function () {
    const res = await app.inject('/pages/test_id')
    assert.strictEqual(res.statusCode, 404)
  })

  it('should handle /pages/test_id/edit route correctly', async function () {
    const res = await app.inject('/pages/test_id/edit')
    assert.strictEqual(res.statusCode, 404)
  })

  it('should handle /pages/_id route correctly', async function () {
    const res = await app.inject('/pages/_id')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { route: '/pages/:id/' })
  })

  it('should handle /pages/_id/edit route correctly', async function () {
    const res = await app.inject('/pages/_id/edit')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { route: '/pages/:id/edit' })
  })

  it('should handle /users/test_id/details route correctly', async function () {
    const res = await app.inject('/users/test_id/details')
    assert.strictEqual(res.statusCode, 404)
  })

  it('should handle /users/_id/details route correctly', async function () {
    const res = await app.inject('/users/_id/details')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { route: '/users/:id/details' })
  })
})
