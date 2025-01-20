'use strict'

const { after, before, describe, it } = require('node:test')
const assert = require('node:assert')
const Fastify = require('fastify')

describe('Node test suite for index package', function () {
  const app = Fastify()

  before(async function () {
    app.register(require('./index-package/app'))
    await app.ready()
  })

  after(async function () {
    await app.close()
  })

  it('should respond correctly to /foo/bar', async function () {
    const res = await app.inject({ url: '/foo/bar' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { success: true })
  })
})
