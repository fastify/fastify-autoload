'use strict'

const { after, before, describe, it } = require('node:test')
const path = require('node:path')
const Fastify = require('fastify')
const autoLoad = require('../../../')
const assert = require('node:assert')

describe('Issue 326: setNotFoundHandler from autohooks must remain under prefixed scope', function () {
  const app = Fastify()

  before(async function () {
    app.register(autoLoad, {
      dir: path.join(__dirname, 'routes', 'api'),
      autoHooks: true,
      cascadeHooks: true,
      options: { prefix: '/api' }
    })

    await app.ready()
  })

  after(async function () {
    await app.close()
  })

  it('keeps autohooks notFound handler for prefixed paths only', async function () {
    const prefixed = await app.inject({ method: 'GET', url: '/api/not-exists' })
    assert.strictEqual(prefixed.statusCode, 404)
    assert.deepStrictEqual(prefixed.json(), { scope: 'api', url: '/api/not-exists' })

    const root = await app.inject({ method: 'GET', url: '/not-exists' })
    assert.strictEqual(root.statusCode, 404)
    assert.notDeepStrictEqual(root.json(), { scope: 'api', url: '/not-exists' })
    assert.strictEqual(root.json().scope, undefined)
  })
})
