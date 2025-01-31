'use strict'

const { after, before, describe, it } = require('node:test')
const assert = require('node:assert')
const Fastify = require('fastify')

describe('Node test suite for route parameters basic', function () {
  const app = Fastify()

  before(async function () {
    app.register(require('./route-parameters/basic'))
    await app.ready()
  })

  after(async function () {
    await app.close()
  })

  it('should respond correctly to /users', async function () {
    const res = await app.inject({ url: '/users' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), {
      users: [{ id: 7, username: 'example' }],
    })
  })

  it('should respond correctly to /users/7', async function () {
    const res = await app.inject({ url: '/users/7' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), {
      user: { id: '7', username: 'example' },
    })
  })

  it('should respond correctly to /users/_id', async function () {
    const res = await app.inject({ url: '/users/_id' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), {
      user: { id: '_id', username: 'example' },
    })
  })

  it('should respond correctly to /be-nl', async function () {
    const res = await app.inject({ url: '/be-nl' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), {
      country: 'be',
      language: 'nl',
    })
  })
})
