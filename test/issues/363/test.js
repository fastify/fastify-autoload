'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert')
const path = require('node:path')
const Fastify = require('fastify')
const autoLoad = require('../../../')

describe('Issue 363: fileNameRoutePrefix option', function () {
  it('should prefix routes by filename when fileNameRoutePrefix is true', async function () {
    const app = Fastify()
    app.register(autoLoad, {
      dir: path.join(__dirname, 'routes'),
      fileNameRoutePrefix: true,
      routeParams: true
    })
    await app.ready()

    // Root-level file
    const resRoot = await app.inject({ url: '/root-endpoint' })
    assert.strictEqual(resRoot.statusCode, 200)
    assert.deepStrictEqual(resRoot.json(), { endpoint: 'root-endpoint' })

    // Nested file
    const resList = await app.inject({ url: '/posts/list' })
    assert.strictEqual(resList.statusCode, 200)
    assert.deepStrictEqual(resList.json(), { endpoint: 'posts-list' })

    // Route param file
    const resParam = await app.inject({ url: '/posts/42' })
    assert.strictEqual(resParam.statusCode, 200)
    assert.deepStrictEqual(resParam.json(), { endpoint: 'posts-detail', id: '42' })

    // Index file should NOT be prefixed with /index
    const resUsers = await app.inject({ url: '/users' })
    assert.strictEqual(resUsers.statusCode, 200)
    assert.deepStrictEqual(resUsers.json(), { endpoint: 'users-index' })

    const resUsersIndex = await app.inject({ url: '/users/index' })
    assert.strictEqual(resUsersIndex.statusCode, 404)

    await app.close()
  })

  it('should prefix routes by filename without directory prefix when dirNameRoutePrefix is false', async function () {
    const app = Fastify()
    app.register(autoLoad, {
      dir: path.join(__dirname, 'routes'),
      dirNameRoutePrefix: false,
      fileNameRoutePrefix: true
    })
    await app.ready()

    const resList = await app.inject({ url: '/list' })
    assert.strictEqual(resList.statusCode, 200)
    assert.deepStrictEqual(resList.json(), { endpoint: 'posts-list' })

    await app.close()
  })

  it('should support autoHooks when fileNameRoutePrefix is true', async function () {
    const app = Fastify()
    app.register(autoLoad, {
      dir: path.join(__dirname, 'routes'),
      fileNameRoutePrefix: true,
      autoHooks: true
    })
    await app.ready()

    const resOne = await app.inject({ url: '/items/one' })
    assert.strictEqual(resOne.statusCode, 200)
    assert.deepStrictEqual(resOne.json(), { item: 1, hooked: true })

    const resTwo = await app.inject({ url: '/items/two' })
    assert.strictEqual(resTwo.statusCode, 200)
    assert.deepStrictEqual(resTwo.json(), { item: 2, hooked: true })

    await app.close()
  })

  it('should support fileNameRoutePrefix as a function returning string or false', async function () {
    const app = Fastify()
    app.register(autoLoad, {
      dir: path.join(__dirname, 'routes'),
      fileNameRoutePrefix: (folderParent, fileName) => {
        if (fileName === 'root-endpoint') {
          return 'custom-root'
        }
        if (fileName === 'list') {
          return 'all-posts'
        }
        if (fileName === 'one') {
          return false
        }
        return fileName
      }
    })
    await app.ready()

    // Root-level file rewritten by function
    const resRoot = await app.inject({ url: '/custom-root' })
    assert.strictEqual(resRoot.statusCode, 200)
    assert.deepStrictEqual(resRoot.json(), { endpoint: 'root-endpoint' })

    // Nested file rewritten by function
    const resAll = await app.inject({ url: '/posts/all-posts' })
    assert.strictEqual(resAll.statusCode, 200)
    assert.deepStrictEqual(resAll.json(), { endpoint: 'posts-list' })

    // Nested file returning false uses directory prefix only
    const resOne = await app.inject({ url: '/items' })
    assert.strictEqual(resOne.statusCode, 200)
    assert.deepStrictEqual(resOne.json(), { item: 1 })

    // Other nested file returning filename
    const resTwo = await app.inject({ url: '/items/two' })
    assert.strictEqual(resTwo.statusCode, 200)
    assert.deepStrictEqual(resTwo.json(), { item: 2 })

    await app.close()
  })

  it('should allow fileNameRoutePrefix function to skip prefix on root-level file', async function () {
    const app = Fastify()
    app.register(autoLoad, {
      dir: path.join(__dirname, 'routes'),
      fileNameRoutePrefix: (folderParent, fileName) => {
        if (fileName === 'root-endpoint') {
          return false
        }
        return fileName
      }
    })
    await app.ready()

    const resRoot = await app.inject({ url: '/' })
    assert.strictEqual(resRoot.statusCode, 200)
    assert.deepStrictEqual(resRoot.json(), { endpoint: 'root-endpoint' })

    await app.close()
  })
})
