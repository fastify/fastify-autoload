import t from 'tap'
import fastify from 'fastify'
import autoHooksBasic from './autohooks/basic.mjs'
import autoHooksCascade from './autohooks/cascade.mjs'
import autoHooksOverwrite from './autohooks/overwrite.mjs'
import autoHooksDisabled from './autohooks/disabled.mjs'
import autoHooksNotFoundHandler from './autohooks/not-found-handler.mjs'

const { test } = t

test('autohooks: Default behaviour', async () => {
  const app = fastify()
  let res

  app.register(autoHooksBasic)
  app.decorateRequest('hooked', '')

  await app.ready()

  res = await app.inject('/')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { hooked: ['root'] })

  res = await app.inject('/child')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { hooked: ['child'] })

  res = await app.inject('/child/grandchild')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { hooked: ['grandchild'] })

  res = await app.inject('/sibling')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { hooked: '' })
})

test('autohooks: Cascade behaviour', async () => {
  const app = fastify()
  let res

  app.register(autoHooksCascade)
  app.decorateRequest('hooked', '')

  await app.ready()

  res = await app.inject('/')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { hooked: ['root'] })

  res = await app.inject('/child')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { hooked: ['root', 'child'] })

  res = await app.inject('/child/grandchild')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { hooked: ['root', 'child', 'grandchild'] })

  res = await app.inject('/sibling')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { hooked: ['root'] })
})

test('autohooks: Overwrite cascade behaviour', async () => {
  const app = fastify()
  let res

  app.register(autoHooksOverwrite)
  app.decorateRequest('hooked', '')

  await app.ready()

  res = await app.inject('/')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { hooked: ['root'] })

  res = await app.inject('/child')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { hooked: ['child'] })

  res = await app.inject('/child/grandchild')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { hooked: ['grandchild'] })

  res = await app.inject('/sibling')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { hooked: ['root'] })
})

test('autohooks: Disabled behaviour', async () => {
  const app = fastify()
  let res

  app.register(autoHooksDisabled)
  app.decorateRequest('hooked', 'disabled')

  await app.ready()

  res = await app.inject('/')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { hooked: 'disabled' })

  res = await app.inject('/child')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { hooked: 'disabled' })

  res = await app.inject('/child/grandchild')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { hooked: 'disabled' })

  res = await app.inject('/sibling')
  t.equal(res.statusCode, 200)
  t.same(res.json(), { hooked: 'disabled' })
})

test('autohooks: Not found handler', async () => {
  const app = fastify()
  app.register(autoHooksNotFoundHandler)

  app.setNotFoundHandler((request, reply) => {
    reply.code(404)
      .header('from', 'root')
      .send()
  })

  app.ready(function (err) {
    t.error(err)

    app.inject({
      url: '/not-exists'
    }, function (err, res) {
      t.error(err)
      t.equal(res.headers.from, 'root')

      t.equal(res.statusCode, 404)
    })

    app.inject({
      url: '/child'
    }, function (err, res) {
      t.error(err)

      t.equal(res.statusCode, 200)
    })

    app.inject({
      url: '/child/not-exists'
    }, function (err, res) {
      t.error(err)
      t.equal(res.headers.from, 'routes-a/child')

      t.equal(res.statusCode, 404)
    })

    app.inject({
      url: '/sibling'
    }, function (err, res) {
      t.error(err)

      t.equal(res.statusCode, 200)
    })

    app.inject({
      url: '/sibling/not-exists'
    }, function (err, res) {
      t.error(err)
      t.equal(res.headers.from, 'routes-a/sibling')

      t.equal(res.statusCode, 404)
    })

    app.inject({
      url: '/custom-prefix'
    }, function (err, res) {
      t.error(err)

      t.equal(res.statusCode, 200)
    })

    app.inject({
      url: '/custom-prefix/not-exists'
    }, function (err, res) {
      t.error(err)
      t.equal(res.headers.from, 'routes-b')

      t.equal(res.statusCode, 404)
    })
  })
})
