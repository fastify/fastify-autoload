'use strict'

const { afterEach, beforeEach, describe, it } = require('node:test')
const assert = require('node:assert')
const path = require('node:path')
const Fastify = require('fastify')
const autoLoad = require('../../../')

describe('Issue 388 tests', function () {
  let app

  beforeEach(async function () {
    app = Fastify()
  })

  afterEach(async function () {
    await app.close()
  })

  it('should respond 404 to /', async function () {
    app = Fastify()
    app.register(autoLoad, {
      dir: path.join(__dirname, 'routes'),
    })
    await app.ready()

    const res = await app.inject({ url: '/' })

    assert.strictEqual(res.statusCode, 404)
  })

  it('should respond 200 to / when script pattern is loaded', async function () {
    app = Fastify()
    app.register(autoLoad, {
      dir: path.join(__dirname, 'routes'),
      scriptPattern: /(js|ts|tsx)$/,
    })
    await app.ready()

    const res = await app.inject({ url: '/' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { tsx: 'ok' })
  })
})
