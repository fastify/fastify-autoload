'use strict'

const t = require('tap')
const Fastify = require('fastify')

t.plan(115)

const app = Fastify()

app.register(require('./basic/app'))

app.ready(function (err) {
  t.error(err)

  t.equal(app.foo, 'bar')

  app.inject({
    url: '/something'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { something: 'else' })
  })

  app.inject({
    url: '/autoroute/items/1'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { answer: 42 })
  })

  app.inject({
    url: '/autoroute/items'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), [{ answer: 42 }, { answer: 41 }])
  })

  app.inject({
    url: '/autowrap/1'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { answer: 42 })
  })

  app.inject({
    url: '/autowrap'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), [{ answer: 42 }, { answer: 41 }])
  })

  app.inject({
    url: '/manualprefix/semiautomatic/items/1'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { answer: 42 })
  })

  app.inject({
    url: '/manualprefix/semiautomatic/items'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), [{ answer: 42 }, { answer: 41 }])
  })

  app.inject({
    url: '/bar'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { foo: 'bar' })
  })

  app.inject({
    url: '/prefixed'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { something: 'else' })
  })

  app.inject({
    url: '/default'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { exports: 'default' })
  })

  app.inject({
    url: '/skip'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 404)
  })

  app.inject({
    url: '/options'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), {
      foo: 'bar'
    })
  })

  app.inject({
    url: '/defaultPrefix'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { index: true })
  })

  app.inject({
    url: '/defaultPrefix/prefixed'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { prefixed: true })
  })

  app.inject({
    url: '/defaultPrefix/overriddenPrefix'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 404)
  })

  app.inject({
    url: '/defaultPrefix/nested'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { indexNested: true })
  })

  app.inject({
    url: '/defaultPrefix/nested/prefixedNested'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { prefixedNested: true })
  })

  app.inject({
    url: '/defaultPrefix/nested/overriddenPrefix'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 404)
  })

  app.inject({
    url: '/overriddenPrefix'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { overide: 'prefix' })
  })

  app.inject({
    url: '/overriddenPrefixNested'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { overide: 'prefixNested' })
  })

  app.inject({
    url: '/noPrefix'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { no: 'prefix' })
  })

  app.inject({
    url: '/noPrefixNested'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { no: 'prefixNested' })
  })

  app.inject({
    url: '/a/b/c'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(res.payload.toString(), 'd')
  })

  app.inject({
    url: '/custom-index/'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { custom: true })
  })

  app.inject({
    url: '/index/'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { works: true })
  })

  app.inject({
    url: '/index/bar/'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { works: true })
  })

  ;[
    '/rewrite-route-prefix',
    '/rewrite-route-prefix/',
    '/rewrite-route-prefix/tre',
    '/rewrite-route-prefix/tre/',
    '/rewrite-route-prefix/tre/empty/'
  ].forEach(url => {
    app.inject(url, function (err, res) {
      t.error(err)
      t.equal(res.statusCode, 200, `OK ${url}`)
      t.same(JSON.parse(res.payload), { works: true }, `PAYLOAD ${url}`)
    })
  })

  app.inject({
    url: '/index/ignored'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 404)
  })

  app.inject({
    url: '/one/'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { works: true })
  })

  app.inject({
    url: '/one/two/three'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { works: true })
  })

  app.inject({ url: '/routeParams' }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { works: true })
  })

  app.inject({ url: '/routeParams/foo' }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { works: true })
  })

  app.inject({ url: '/routeParams/foo/1' }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { works: true, id1: '1' })
  })

  app.inject({ url: '/routeParams/foo/abc/bar/2' }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { works: true, id1: 'abc', id2: '2' })
  })

  app.inject({
    url: '/encapsulate'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { works: true })
  })
})
