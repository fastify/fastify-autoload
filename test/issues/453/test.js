'use strict'

const { beforeEach, afterEach, describe, it } = require('node:test')
const assert = require('node:assert')
const path = require('node:path')
const Fastify = require('fastify')
const autoLoad = require('../../../')

const startApp = async (autoloadConfig) => {
  const app = Fastify()
  app.addHook('onRequest', async (request) => {
    request.hooksUsed = []
  })
  app.register(autoLoad, {
    dir: path.join(__dirname, 'routes'),
    autoHooks: true,
    ...autoloadConfig,
  })
  app.decorateRequest('hooksUsed')
  await app.ready()
  return app
}

describe('Issue 453 tests', function () {
  describe('cascadeHooks === false', () => {
    describe('dirNameRoutePrefix === true not interfere with auto hooks', () => {
      let app

      beforeEach(async function () {
        app = await startApp({
          cascadeHooks: false,
          dirNameRoutePrefix: true
        })
      })

      afterEach(async function () {
        await app.close()
      })

      it('should only use global hook in global route', async function () {
        const res = await app.inject({ url: '/global' })
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(JSON.parse(res.body), { hooksUsed: ['global'] })
      })

      it('should only use child hook in child route', async function () {
        const res = await app.inject({ url: '/first/first' })
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(JSON.parse(res.body), { hooksUsed: ['first'] })
      })

      it('should only use grandchild hook in grandchild route', async function () {
        const res = await app.inject({ url: '/first/fourth/fourth' })
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(JSON.parse(res.body), { hooksUsed: ['fourth'] })
      })
    })
    describe('dirNameRoutePrefix === false not interfere with auto hooks', () => {
      let app

      beforeEach(async function () {
        app = await startApp({
          cascadeHooks: false,
          dirNameRoutePrefix: false
        })
      })

      afterEach(async function () {
        await app.close()
      })

      it('should only use global hook in global route', async function () {
        const res = await app.inject({ url: '/global' })
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(JSON.parse(res.body), { hooksUsed: ['global'] })
      })

      it('should only use child hook in child route', async function () {
        const res = await app.inject({ url: '/first' })
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(JSON.parse(res.body), { hooksUsed: ['first'] })
      })

      it('should only use grandchild hook in grandchild route', async function () {
        const res = await app.inject({ url: '/fourth' })
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(JSON.parse(res.body), { hooksUsed: ['fourth'] })
      })
    })
    describe('dirNameRoutePrefix === () => false not interfere with auto hooks', () => {
      let app

      beforeEach(async function () {
        app = await startApp({
          cascadeHooks: false,
          dirNameRoutePrefix: () => {
            return false
          }
        })
      })

      afterEach(async function () {
        await app.close()
      })

      it('should only use global hook in global route', async function () {
        const res = await app.inject({ url: '/global' })
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(JSON.parse(res.body), { hooksUsed: ['global'] })
      })

      it('should only use child hook in child route', async function () {
        const res = await app.inject({ url: '/first' })
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(JSON.parse(res.body), { hooksUsed: ['first'] })
      })

      it('should only use grandchild hook in grandchild route', async function () {
        const res = await app.inject({ url: '/fourth' })
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(JSON.parse(res.body), { hooksUsed: ['fourth'] })
      })
    })
  })

  describe('cascadeHooks === true', () => {
    describe('dirNameRoutePrefix === true not interfere with auto hooks', () => {
      let app

      beforeEach(async function () {
        app = await startApp({
          cascadeHooks: true,
          dirNameRoutePrefix: true
        })
      })

      afterEach(async function () {
        await app.close()
      })

      it('should only use global hook in global route', async function () {
        const res = await app.inject({ url: '/global' })
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(JSON.parse(res.body), { hooksUsed: ['global'] })
      })

      it('should use hooks till child in child route', async function () {
        const res = await app.inject({ url: '/first/first' })
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(JSON.parse(res.body), { hooksUsed: ['global', 'first'] })
      })

      it('should use hooks till grandchild in grandchild route', async function () {
        const res = await app.inject({ url: '/first/fourth/fourth' })
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(JSON.parse(res.body), { hooksUsed: ['global', 'first', 'fourth'] })
      })
    })
    describe('dirNameRoutePrefix === false not interfere with auto hooks', () => {
      let app

      beforeEach(async function () {
        app = await startApp({
          cascadeHooks: true,
          dirNameRoutePrefix: false
        })
      })

      afterEach(async function () {
        await app.close()
      })

      it('should only use global hook in global route', async function () {
        const res = await app.inject({ url: '/global' })
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(JSON.parse(res.body), { hooksUsed: ['global'] })
      })

      it('should use hooks till child in child route', async function () {
        const res = await app.inject({ url: '/first' })
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(JSON.parse(res.body), { hooksUsed: ['global', 'first'] })
      })

      it('should use hooks till grandchild in grandchild route', async function () {
        const res = await app.inject({ url: '/fourth' })
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(JSON.parse(res.body), { hooksUsed: ['global', 'first', 'fourth'] })
      })
    })
    describe('dirNameRoutePrefix === () => false not interfere with auto hooks', () => {
      let app

      beforeEach(async function () {
        app = await startApp({
          cascadeHooks: true,
          dirNameRoutePrefix: () => {
            return false
          }
        })
      })

      afterEach(async function () {
        await app.close()
      })

      it('should only use global hook in global route', async function () {
        const res = await app.inject({ url: '/global' })
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(JSON.parse(res.body), { hooksUsed: ['global'] })
      })

      it('should use hooks till child in child route', async function () {
        const res = await app.inject({ url: '/first' })
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(JSON.parse(res.body), { hooksUsed: ['global', 'first'] })
      })

      it('should use hooks till grandchild in grandchild route', async function () {
        const res = await app.inject({ url: '/fourth' })
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(JSON.parse(res.body), { hooksUsed: ['global', 'first', 'fourth'] })
      })
    })
  })
})
