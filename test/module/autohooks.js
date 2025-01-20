import { after, before, describe, it } from 'node:test'
import assert from 'node:assert'
import fastify from 'fastify'
import autoHooksBasic from './autohooks/basic.mjs'
import autoHooksCascade from './autohooks/cascade.mjs'
import autoHooksOverwrite from './autohooks/overwrite.mjs'
import autoHooksDisabled from './autohooks/disabled.mjs'

describe('autohooks: Default behaviour', function () {
  const app = fastify()

  before(async function () {
    app.register(autoHooksBasic)
    app.decorateRequest('hooked', '')
    await app.ready()
  })

  after(async function () {
    await app.close()
  })

  it('should respond correctly to /', async function () {
    const res = await app.inject('/')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { hooked: ['root'] })
  })

  it('should respond correctly to /child', async function () {
    const res = await app.inject('/child')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { hooked: ['child'] })
  })

  it('should respond correctly to /child/grandchild', async function () {
    const res = await app.inject('/child/grandchild')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { hooked: ['grandchild'] })
  })

  it('should respond correctly to /sibling', async function () {
    const res = await app.inject('/sibling')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { hooked: '' })
  })
})

describe('autohooks: Cascade behaviour', function () {
  const app = fastify()

  before(async function () {
    app.register(autoHooksCascade)
    app.decorateRequest('hooked', '')
    await app.ready()
  })

  after(async function () {
    await app.close()
  })

  it('should respond correctly to /', async function () {
    const res = await app.inject('/')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { hooked: ['root'] })
  })

  it('should respond correctly to /child', async function () {
    const res = await app.inject('/child')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { hooked: ['root', 'child'] })
  })

  it('should respond correctly to /child/grandchild', async function () {
    const res = await app.inject('/child/grandchild')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), {
      hooked: ['root', 'child', 'grandchild'],
    })
  })

  it('should respond correctly to /sibling', async function () {
    const res = await app.inject('/sibling')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { hooked: ['root'] })
  })
})

describe('autohooks: Overwrite cascade behaviour', function () {
  const app = fastify()

  before(async function () {
    app.register(autoHooksOverwrite)
    app.decorateRequest('hooked', '')
    await app.ready()
  })

  after(async function () {
    await app.close()
  })

  it('should respond correctly to /', async function () {
    const res = await app.inject('/')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { hooked: ['root'] })
  })

  it('should respond correctly to /child', async function () {
    const res = await app.inject('/child')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { hooked: ['child'] })
  })

  it('should respond correctly to /child/grandchild', async function () {
    const res = await app.inject('/child/grandchild')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { hooked: ['grandchild'] })
  })

  it('should respond correctly to /sibling', async function () {
    const res = await app.inject('/sibling')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { hooked: ['root'] })
  })
})

describe('autohooks: Disabled behaviour', function () {
  const app = fastify()

  before(async function () {
    app.register(autoHooksDisabled)
    app.decorateRequest('hooked', 'disabled')
    await app.ready()
  })

  after(async function () {
    await app.close()
  })

  it('should respond correctly to /', async function () {
    const res = await app.inject('/')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { hooked: 'disabled' })
  })

  it('should respond correctly to /child', async function () {
    const res = await app.inject('/child')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { hooked: 'disabled' })
  })

  it('should respond correctly to /child/grandchild', async function () {
    const res = await app.inject('/child/grandchild')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { hooked: 'disabled' })
  })

  it('should respond correctly to /sibling', async function () {
    const res = await app.inject('/sibling')
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(res.json(), { hooked: 'disabled' })
  })
})
