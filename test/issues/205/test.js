'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert')
const path = require('node:path')
const Fastify = require('fastify')
const autoLoad = require('../../../')

describe('Issue 205: append autoPrefix to directory prefixes without breaking defaults', function () {
  it('keeps autoPrefix overriding directory prefixes by default', async function () {
    const app = Fastify()

    app.register(autoLoad, {
      dir: path.join(__dirname, 'routes'),
      options: { prefix: '/hooked-plugin' }
    })
    await app.ready()

    try {
      const overridden = await app.inject({ method: 'GET', url: '/hooked-plugin/batch/entity' })
      assert.strictEqual(overridden.statusCode, 200)
      assert.deepStrictEqual(overridden.json(), { ok: true })

      const appended = await app.inject({ method: 'GET', url: '/hooked-plugin/children/batch/entity' })
      assert.strictEqual(appended.statusCode, 404)
    } finally {
      await app.close()
    }
  })

  it('concatenates directory prefixes before plugin autoPrefix when enabled', async function () {
    const app = Fastify()

    app.register(autoLoad, {
      dir: path.join(__dirname, 'routes'),
      options: { prefix: '/hooked-plugin' },
      appendAutoPrefix: true
    })
    await app.ready()

    try {
      const appended = await app.inject({ method: 'GET', url: '/hooked-plugin/children/batch/entity' })
      assert.strictEqual(appended.statusCode, 200)
      assert.deepStrictEqual(appended.json(), { ok: true })

      const overridden = await app.inject({ method: 'GET', url: '/hooked-plugin/batch/entity' })
      assert.strictEqual(overridden.statusCode, 404)
    } finally {
      await app.close()
    }
  })
})
