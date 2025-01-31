'use strict'

const { after, before, describe, it } = require('node:test')
const assert = require('node:assert')
const Fastify = require('fastify')

describe('Node test suite for babel-node', function () {
  const app = Fastify()

  before(async function () {
    app.register(require('./cyclic-dependency/app'))
  })

  after(async function () {
    await app.close()
  })

  it('should return cyclic dependency error', async function () {
    await assert.rejects(app.ready(), { message: 'Cyclic dependency' })
  })
})
