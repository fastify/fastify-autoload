'use strict'

const { after, before, describe, it, suite } = require('node:test')
const assert = require('node:assert')
const Fastify = require('fastify')

describe('Node test suite for independent of module support', function () {
  suite('unexpected token', async function () {
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

  suite('cannot import plugin index', async function () {
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

  suite('cannot import plugin typescript', async function () {
    const app = Fastify()

    before(async function () {
      app.register(require('./ts-error/app'))
    })

    after(async function () {
      await app.close()
    })

    it('should return cannot import plugin typescript error', async function () {
      await assert.rejects(app.ready(), Error, /cannot import plugin.*typescript/i)
    })
  })

  suite('cyclic dependency error', async function () {
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
})
