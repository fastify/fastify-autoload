'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert')
const path = require('node:path')
const Fastify = require('fastify')
const AutoLoad = require('../../')

function build (fixture) {
  const app = Fastify()
  app.register(AutoLoad, {
    dir: path.join(__dirname, 'autohooks-dependency', fixture),
    autoHooks: true
  })
  return app
}

describe('Node test suite for autohooks with cross-directory dependencies', function () {
  it('should fail when an unhooked plugin depends on a plugin in a hooked child directory', async function (t) {
    const app = build('hooked-child')
    t.after(() => app.close())

    await assert.rejects(app.ready(), {
      message: /plugin 'health' depends on 'admin-users', which is located in a different directory with autohooks/
    })
  })

  it('should fail when an unhooked child plugin depends on a plugin in a hooked root directory', async function (t) {
    const app = build('hooked-root')
    t.after(() => app.close())

    await assert.rejects(app.ready(), {
      message: /plugin 'public' depends on 'root-secret', which is located in a different directory with autohooks/
    })
  })

  it('should fail when a hooked plugin depends on a plugin in another hooked directory', async function (t) {
    const app = build('hooked-to-hooked')
    t.after(() => app.close())

    await assert.rejects(app.ready(), {
      message: /plugin 'a-x' depends on 'b-y', which is located in a different directory with autohooks/
    })
  })

  it('should keep autohooks for dependencies in the same directory', async function (t) {
    const app = build('same-directory')
    t.after(() => app.close())
    await app.ready()

    for (const url of ['/admin/a', '/admin/b']) {
      const unauthorized = await app.inject({ url })
      assert.strictEqual(unauthorized.statusCode, 401)

      const authorized = await app.inject({ url, headers: { authorization: 'Bearer token' } })
      assert.strictEqual(authorized.statusCode, 200)
    }
  })
})
