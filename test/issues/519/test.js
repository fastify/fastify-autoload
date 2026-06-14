'use strict'

const { afterEach, describe, it } = require('node:test')
const assert = require('node:assert')
const path = require('node:path')
const Fastify = require('fastify')
const autoLoad = require('../../../')

describe('Issue 519: ignorePattern should match against the relative file path, not just the entry basename', function () {
  let app

  afterEach(async function () {
    await app.close()
  })

  it('ignorePattern with a path-component regex skips only the matched subdirectory file', async function () {
    app = Fastify()
    app.register(autoLoad, {
      dir: path.join(__dirname, 'routes'),
      ignorePattern: /private\/plugin/,
    })
    await app.ready()

    const pub = await app.inject({ url: '/public' })
    assert.strictEqual(pub.statusCode, 200)
    assert.deepStrictEqual(pub.json(), { zone: 'public' })

    const priv = await app.inject({ url: '/private' })
    assert.strictEqual(priv.statusCode, 404, 'private route should be excluded by ignorePattern path match')
  })
})
