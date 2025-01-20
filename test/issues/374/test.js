'use strict'

const { after, before, describe, it } = require('node:test')
const assert = require('node:assert')
const path = require('node:path')
const Fastify = require('fastify')
const autoLoad = require('../../../')

describe('Issue 374 tests', function () {
  const app = Fastify()

  before(async function () {
    app.register(autoLoad, {
      dir: path.join(__dirname, 'routes'),
      autoHooks: true,
      cascadeHooks: true,
      routeParams: true,
    })
    await app.ready()
  })

  after(async function () {
    await app.close()
  })

  it('should respond correctly to /', async function () {
    const res = await app.inject({ url: '/' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { path: '/' })
  })

  it('should respond correctly to /entity', async function () {
    const res = await app.inject({ url: '/entity' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { path: '/entity', hooked: ['root'] })
  })

  it('should respond correctly to /entity/1', async function () {
    const res = await app.inject({ url: '/entity/1' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), {
      path: '/entity/1',
      hooked: ['root'],
      params: { entity: '1' },
    })
  })
})
