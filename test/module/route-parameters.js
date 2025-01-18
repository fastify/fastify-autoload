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

  it('should handle routes correctly', async function () {
    let res = await app.inject('/')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { route: '/' })

    res = await app.inject('/pages')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { route: '/pages' })

    res = await app.inject('/pages/archived')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { route: '/pages/archived' })

    res = await app.inject('/pages/test_id')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { route: '/pages/:id/', id: 'test_id' })

    res = await app.inject('/pages/test_id/edit')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), {
      route: '/pages/:id/edit',
      id: 'test_id',
    })

    res = await app.inject('/users/test_id/details')
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

  it('should handle routes correctly', async function () {
    let res = await app.inject('/')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { route: '/' })

    res = await app.inject('/pages')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { route: '/pages' })

    res = await app.inject('/pages/archived')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { route: '/pages/archived' })

    res = await app.inject('/pages/test_id')
    assert.strictEqual(res.statusCode, 404)

    res = await app.inject('/pages/test_id/edit')
    assert.strictEqual(res.statusCode, 404)

    res = await app.inject('/pages/_id')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { route: '/pages/:id/' })

    res = await app.inject('/pages/_id/edit')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { route: '/pages/:id/edit' })

    res = await app.inject('/users/test_id/details')
    assert.strictEqual(res.statusCode, 404)

    res = await app.inject('/users/_id/details')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { route: '/users/:id/details' })
  })
})
