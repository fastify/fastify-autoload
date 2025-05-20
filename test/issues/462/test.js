'use strict'

const { after, before, describe, it } = require('node:test')
const path = require('node:path')
const Fastify = require('fastify')
const autoLoad = require('../../../')
const assert = require('node:assert')

describe('Issue 462 tests', function () {
  const app = Fastify()

  before(async function () {
    app.register(autoLoad, {
      dir: path.join(__dirname, 'routes'),
      forceESM: true,
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
})
