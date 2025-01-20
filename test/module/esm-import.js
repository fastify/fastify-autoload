import { afterEach, describe, it } from 'node:test'
import assert from 'node:assert'
import fastify from 'fastify'
import esmImportAppDefault from './esm-import/app-default.js'
import esmImportAppNamed from './esm-import/app-named.js'
import esmImportAppStarDefault from './esm-import/app-star-default.js'
import esmImportAppStarNamed from './esm-import/app-star-named.js'

describe('ESM import tests', async function () {
  let app
  afterEach(async () => {
    await app.close()
  })

  it('default', async function () {
    app = fastify()
    app.register(esmImportAppDefault)
    await app.ready()

    const res = await app.inject('/default')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { script: 'default' })
    await app.close()
  })

  it('named', async function () {
    app = fastify()
    app.register(esmImportAppNamed)
    await app.ready()

    const res = await app.inject('/named')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { script: 'named' })
    await app.close()
  })

  it('star default', async function () {
    app = fastify()
    app.register(esmImportAppStarDefault)
    await app.ready()

    const res = await app.inject('/star-default')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { script: 'star-default' })
    await app.close()
  })

  it('star named', async function () {
    app = fastify()
    app.register(esmImportAppStarNamed)
    await app.ready()

    const res = await app.inject('/star-named')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { script: 'star-named' })
  })
})
