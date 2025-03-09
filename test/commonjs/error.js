'use strict'

const { after, before, describe, it } = require('node:test')
const assert = require('node:assert')
const Fastify = require('fastify')

const runtime = require('../../lib/runtime')

describe('independent module support - unexpected token', function () {
  const app = Fastify()

  before(async function () {
    app.register(require('./syntax-error/app'))
  })

  after(async function () {
    await app.close()
  })

  it('should return unexpected token error', async function () {
    await assert.rejects(app.ready(), SyntaxError, /unexpected token/i)
  })
})

describe('independent module support - cannot import plugin index', function () {
  const app = Fastify()

  before(async function () {
    app.register(require('./index-error/app'))
  })

  after(async function () {
    await app.close()
  })

  it('should return cannot import plugin index error', async function () {
    await assert.rejects(app.ready(), Error, /cannot import plugin.*index/i)
  })
})

describe('independent module support - cannot import plugin typescript', function () {
  const app = Fastify()

  before(async function () {
    app.register(require('./ts-error/app'))
  })

  after(async function () {
    await app.close()
  })

  it('should return cannot import plugin typescript error', async function () {
    if (runtime.supportNativeTypeScript) {
      assert.doesNotThrow(() => app.ready())
    } else {
      await assert.rejects(app.ready(), Error, /cannot import plugin.*typescript/i)
    }
  })
})

describe('independent module support - cyclic dependency error', function () {
  const app = Fastify()

  before(async function () {
    app.register(require('./cyclic-dependency/app'))
  })

  after(async function () {
    await app.close()
  })

  it('should return cannot import plugin typescript error', async function () {
    await assert.rejects(app.ready(), new Error('Cyclic dependency'))
  })
})
