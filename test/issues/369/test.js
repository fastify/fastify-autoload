'use strict'

const { test } = require('tap')
const Fastify = require('fastify')
const autoload = require('../../..')
const path = require('path')

test('Should throw an error when trying to load invalid hooks', async (t) => {
  const app = Fastify()

  app.register(autoload, {
    dir: path.join(__dirname, 'routes-a'),
    autoHooks: true,
    autoHooksPattern: /^.invalid-autohooks.js$/iu
  })

  await t.rejects(app.ready(), new SyntaxError(`Unexpected identifier at ${path.join(__dirname, 'routes-a/.invalid-autohooks.js')}:1`))
})

test('Should throw an error when trying to import hooks plugin using index.ts if typescriptSupport is not enabled', async (t) => {
  const app = Fastify()

  app.register(autoload, {
    dir: path.join(__dirname, 'routes-b'),
    autoHooks: true
  })

  await t.rejects(app.ready(), new Error(`@fastify/autoload cannot import hooks plugin at '${path.join(__dirname, 'routes-b/index.ts')}'. To fix this error compile TypeScript to JavaScript or use 'ts-node' to run your app.`))
})

test('Should not accumulate plugin if doesn\'t comply to matchFilter', async (t) => {
  const app = Fastify()

  app.register(autoload, {
    dir: path.join(__dirname, 'routes-c')
  })

  await app.ready()

  const res = await app.inject({
    url: '/'
  })

  t.equal(res.statusCode, 200)

  const app2 = Fastify()

  app2.register(autoload, {
    dir: path.join(__dirname, 'routes-c'),
    matchFilter: /invalid/
  })

  await app2.ready()

  const res2 = await app2.inject({
    url: '/'
  })

  t.equal(res2.statusCode, 404)
})

test('Should not accumulate plugin if ignoreFilter is matched', async (t) => {
  const app = Fastify()

  app.register(autoload, {
    dir: path.join(__dirname, 'routes-c'),
    ignoreFilter: /\/not-exists.js/
  })

  await app.ready()

  const res = await app.inject({
    url: '/'
  })

  t.equal(res.statusCode, 200)

  const app2 = Fastify()

  app2.register(autoload, {
    dir: path.join(__dirname, 'routes-c'),
    ignoreFilter: /\/routes.js/
  })

  await app2.ready()

  const res2 = await app2.inject({
    url: '/'
  })

  t.equal(res2.statusCode, 404)
})
