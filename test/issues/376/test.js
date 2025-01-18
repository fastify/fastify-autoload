'use strict'

const { after, before, describe, it } = require('node:test')
const assert = require('node:assert')
const path = require('node:path')
const Fastify = require('fastify')
const autoLoad = require('../../../')

describe('Issue 376 tests', function () {
  const app = Fastify()

  before(async function () {
    app.register(autoLoad, {
      dir: path.join(__dirname, 'routes'),
      autoHooks: true,
      options: { prefix: '/api' },
    })

    app.register(autoLoad, {
      dir: path.join(__dirname, 'routes'),
      autoHooks: true,
      options: { prefix: '/prefix/' },
    })
    await app.ready()
  })

  after(async function () {
    await app.close()
  })

  it('should respond correctly to /api', async function () {
    const res = await app.inject({ url: '/api' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { path: '/api' })
  })

  it('should respond correctly to /api/entity', async function () {
    const res = await app.inject({ url: '/api/entity' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), {
      path: '/api/entity',
      hooked: ['root'],
    })
  })

  it('should respond correctly to /prefix', async function () {
    const res = await app.inject({ url: '/prefix' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { path: '/prefix' })
  })

  it('should respond correctly to /prefix/entity', async function () {
    const res = await app.inject({ url: '/prefix/entity' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), {
      path: '/prefix/entity',
      hooked: ['root'],
    })
  })
})
