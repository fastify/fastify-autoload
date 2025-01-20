'use strict'

const { after, before, describe, it } = require('node:test')
const assert = require('node:assert')
const Fastify = require('fastify')
const AutoLoad = require('../../')
const { join } = require('node:path')

describe('Node test suite for babel-node', function () {
  const app = Fastify()

  before(async function () {
    app.register(AutoLoad, {
      dir: join(__dirname, 'babel-node/routes')
    })
    await app.ready()
  })

  after(async function () {
    await app.close()
  })

  it('should respond correctly to /', async function () {
    const res = await app.inject({
      url: '/'
    })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { hello: 'world' })
  })

  it('should respond correctly to /foo', async function () {
    const res = await app.inject({
      url: '/foo'
    })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { foo: 'bar' })
  })
})
