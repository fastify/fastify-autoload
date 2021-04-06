import t from 'tap'
import fastify from 'fastify'
import routeParametersBasic from './route-parameters/basic.mjs'
import routeParametersDisabled from './route-parameters/disabled.mjs'

const { test } = t

test('routeParams: Default behaviour', async () => {
  const app = fastify()
  let res

  app.register(routeParametersBasic)

  await app.ready()

  res = await app.inject('/')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { route: '/' })

  res = await app.inject('/pages')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { route: '/pages' })

  res = await app.inject('/pages/archived')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { route: '/pages/archived' })

  res = await app.inject('/pages/test_id')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { route: '/pages/:id/', id: 'test_id' })

  res = await app.inject('/pages/test_id/edit')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { route: '/pages/:id/edit', id: 'test_id' })

  res = await app.inject('/users/test_id/details')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { route: '/users/:id/details', id: 'test_id' })
})

test('routeParams: off', async () => {
  const app = fastify()
  let res

  app.register(routeParametersDisabled)

  await app.ready()

  res = await app.inject('/')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { route: '/' })

  res = await app.inject('/pages')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { route: '/pages' })

  res = await app.inject('/pages/archived')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { route: '/pages/archived' })

  res = await app.inject('/pages/test_id')
  t.equal(res.statusCode, 404)

  res = await app.inject('/pages/test_id/edit')
  t.equal(res.statusCode, 404)

  res = await app.inject('/pages/_id')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { route: '/pages/:id/' })

  res = await app.inject('/pages/_id/edit')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { route: '/pages/:id/edit' })

  res = await app.inject('/users/test_id/details')
  t.equal(res.statusCode, 404)

  res = await app.inject('/users/_id/details')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { route: '/users/:id/details' })
})
