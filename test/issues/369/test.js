'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert')
const Fastify = require('fastify')
const path = require('node:path')
const autoload = require('../../..')
const runtime = require('../../../lib/runtime')

describe('Issue 369 tests', async function () {
  it('Should throw an error when trying to load invalid hooks', async function () {
    const app = Fastify()
    app.register(autoload, {
      dir: path.join(__dirname, 'invalid-autohooks'),
      autoHooks: true,
    })

    await assert.rejects(app.ready(), /Invalid or unexpected token/)
  })

  it('Should throw an error when trying to import hooks plugin using index.ts if typescriptSupport is not enabled', async function () {
    const app = Fastify()
    app.register(autoload, {
      dir: path.join(__dirname, 'invalid-index-type'),
      autoHooks: true,
    })
    if (runtime.supportNativeTypeScript) {
      assert.doesNotThrow(() => app.ready())
    } else {
      await assert.rejects(
        app.ready(),
        new Error(
        `@fastify/autoload cannot import hooks plugin at '${path.join(
          __dirname,
          'invalid-index-type/index.ts'
        )}'. To fix this error compile TypeScript to JavaScript or use 'ts-node' to run your app.`
        )
      )
    }
  })

  it("Should not accumulate plugin if doesn't comply to matchFilter", async function () {
    const app = Fastify()
    app.register(autoload, {
      dir: path.join(__dirname, 'routes'),
    })

    await app.ready()
    const res = await app.inject({ url: '/' })
    assert.strictEqual(res.statusCode, 200)

    const app2 = Fastify()
    app2.register(autoload, {
      dir: path.join(__dirname, 'routes'),
      matchFilter: /invalid/,
    })

    await app2.ready()
    const res2 = await app2.inject({ url: '/' })
    assert.strictEqual(res2.statusCode, 404)
  })

  it('Should be able to filter paths using a string', async function () {
    const app = Fastify()
    app.register(autoload, {
      dir: path.join(__dirname, 'routes'),
      matchFilter: 'routes.js',
    })

    await app.ready()
    const res = await app.inject({ url: '/' })
    assert.strictEqual(res.statusCode, 200)

    const app2 = Fastify()
    app2.register(autoload, {
      dir: path.join(__dirname, 'routes'),
      matchFilter: 'invalid-path',
    })

    await app2.ready()
    const res2 = await app2.inject({ url: '/' })
    assert.strictEqual(res2.statusCode, 404)
  })

  it('Should be able to filter paths using a function', async function () {
    const app = Fastify()
    app.register(autoload, {
      dir: path.join(__dirname, 'routes'),
      matchFilter: (path) => path.includes('routes.js'),
    })

    await app.ready()
    const res = await app.inject({ url: '/' })
    assert.strictEqual(res.statusCode, 200)

    const app2 = Fastify()
    app2.register(autoload, {
      dir: path.join(__dirname, 'routes'),
      matchFilter: (path) => path.includes('invalid-path'),
    })

    await app2.ready()
    const res2 = await app2.inject({ url: '/' })
    assert.strictEqual(res2.statusCode, 404)
  })

  it('Should not accumulate plugin if ignoreFilter is matched', async function () {
    const app = Fastify()
    app.register(autoload, {
      dir: path.join(__dirname, 'routes'),
      ignoreFilter: /\/not-exists.js/,
    })

    await app.ready()
    const res = await app.inject({ url: '/' })
    assert.strictEqual(res.statusCode, 200)

    const app2 = Fastify()
    app2.register(autoload, {
      dir: path.join(__dirname, 'routes'),
      ignoreFilter: /\/routes.js/,
      autoHooks: true,
    })

    await app2.ready()
    const res2 = await app2.inject({ url: '/' })
    assert.strictEqual(res2.statusCode, 404)
  })

  it('Should not set skip-override if hook plugin is not a function or async function', async function () {
    const app = Fastify()
    app.register(autoload, {
      dir: path.join(__dirname, 'routes'),
      autoHooks: true,
      cascadeHooks: true,
    })

    app.decorateRequest('hooked', '')
    await app.ready()

    const res = await app.inject({ url: '/child' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), {
      hooked: ['root', 'child'],
    })

    const res2 = await app.inject({ url: '/promisified' })
    assert.strictEqual(res2.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res2.payload), { hooked: ['root'] })
  })

  it('Should not enrich non-SyntaxError', async function () {
    const app = Fastify()
    app.register(autoload, {
      dir: path.join(__dirname, 'non-SyntaxError'),
      autoHooks: true,
    })

    await assert.rejects(app.ready(), new ReferenceError('x is not defined'))
  })
})
