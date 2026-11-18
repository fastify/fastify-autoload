'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert')
const path = require('node:path')
const Fastify = require('fastify')
const autoLoad = require('../../')

describe('callback autoConfig without global options', function () {
  it('loads a plugin when the global options object is omitted', async function (t) {
    const app = Fastify()
    t.after(() => app.close())

    app.register(autoLoad, {
      dir: path.join(__dirname, 'auto-config-no-global')
    })
    await app.ready()

    const res = await app.inject({ url: '/' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { loaded: true })
  })
})
