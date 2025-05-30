'use strict'

const { after, before, describe, it, mock } = require('node:test')
const path = require('node:path')
const Fastify = require('fastify')
const autoLoad = require('../../../')
const assert = require('node:assert')

describe('Issue 462: ignore invalid and/or empty .js and .mjs files when using esm', function () {
  const app = Fastify()

  before(async function () {
    app.register(autoLoad, {
      dir: path.join(__dirname, 'routes'),
      forceESM: true,
    })
    mock.method(app.log, 'debug')
    await app.ready()
  })

  after(async function () {
    await app.close()
  })

  it('should respond correctly to /api', async function () {
    const res = await app.inject({ url: '/api' })

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { path: '/api' })

    // check debug call when importing empty/invalid esm files
    // 5 debug log including: empty.cjs, empty.js, empty.mjs, hello.mjs, object.mjs
    // api.mjs pass the check so it will not trigger the debug log
    // increasing this number if there are more empty/invalid esm files you want to test
    assert.strictEqual(app.log.debug.mock.callCount(), 5)
  })
})
