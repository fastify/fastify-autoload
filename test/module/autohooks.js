import t from 'tap'
import fastify from 'fastify'
import autoHooksBasic from './autohooks/basic.mjs'
import autoHooksCascade from './autohooks/cascade.mjs'
import autoHooksOverwrite from './autohooks/overwrite.mjs'
import autoHooksDisabled from './autohooks/disabled.mjs'

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
