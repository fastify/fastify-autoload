'use strict'

// This test tests that automatic loading will skip modules that do not
// export a function, i.e. not a fastify plugin.

const { after, before, describe, it } = require('node:test')
const assert = require('node:assert')
const Fastify = require('fastify')

describe('Node test suite for non-plugin', function () {
  const app = Fastify()

  before(async function () {
    app.register(require('./non-plugin/app'))
    await app.ready()
  })

  after(async function () {
    await app.close()
  })

  it('should respond correctly to /foo', async function () {
    const res = await app.inject({ url: '/foo' })

    assert.strictEqual(res.statusCode, 200)
    assert.strictEqual(res.payload, 'foo')
  })
})
