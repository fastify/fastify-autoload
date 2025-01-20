import { after, before, describe, it } from 'node:test'
import assert from 'node:assert'
import fastify from 'fastify'
import indexPackage from './index-package/app.js'

describe('index package', function () {
  const app = fastify()

  before(async function () {
    app.register(indexPackage)
    await app.ready()
  })

  after(async function () {
    await app.close()
  })

  it('should handle foo/bar correctly', async function () {
    const res = await app.inject('/foo/bar')

    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { success: true })
  })
})
