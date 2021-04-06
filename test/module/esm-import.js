import t from 'tap'
import fastify from 'fastify'
import esmImportAppDefault from './esm-import/app-default.js'
import esmImportAppNamed from './esm-import/app-named.js'
import esmImportAppStarDefault from './esm-import/app-star-default.js'
import esmImportAppStarNamed from './esm-import/app-star-named.js'

const { test } = t

test('default', async () => {
  const app = fastify()

  app.register(esmImportAppDefault)

  await app.ready()

  const res = await app.inject('/default')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { script: 'default' })
})

test('named', async () => {
  const app = fastify()

  app.register(esmImportAppNamed)

  await app.ready()

  const res = await app.inject('/named')

  t.equal(res.statusCode, 200)
  t.same(res.json(), { script: 'named' })
})

test('star-default', async () => {
  const app = fastify()

  app.register(esmImportAppStarDefault)

  await app.ready()

  const res = await app.inject('/star-default')

  t.equal(res.statusCode, 200)
  t.same(res.json(), { script: 'star-default' })
})

test('star-named', async () => {
  const app = fastify()

  app.register(esmImportAppStarNamed)

  await app.ready()

  const res = await app.inject('/star-named')

  t.equal(res.statusCode, 200)
  t.same(res.json(), { script: 'star-named' })
})
