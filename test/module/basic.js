import t from 'tap'
import fastify from 'fastify'
import basicApp from './basic/app.js'

t.plan(74)

const app = fastify()

app.register(basicApp)

app.ready(function (err) {
  t.error(err)

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
    url: '/semiautomatic/items/1'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { answer: 42 })
  })

  app.inject({
    url: '/semiautomatic/items'
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
    url: '/commonjs'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), {
      foo: 'bar'
    })
  })

  app.inject({
    url: '/module'
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
    url: '/overriddenPrefix'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { overide: 'prefix' })
  })

  app.inject({
    url: '/noPrefix'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { no: 'prefix' })
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

  app.inject({
    url: '/ten/'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { works: true })
  })

  app.inject({
    url: '/ten/eight'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { works: true })
  })

  app.inject({
    url: '/nested/shallow'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { works: true })
  })

  app.inject({
    url: '/nested/shallow/deep'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { works: true })
  })

  app.inject({
    url: '/nested/shallow/deep/deeper'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 404)
    t.same(JSON.parse(res.payload), {
      message: 'Route GET:/nested/shallow/deep/deeper not found',
      error: 'Not Found',
      statusCode: 404
    })
  })
})
