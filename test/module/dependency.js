import t from 'tap'
import fastify from 'fastify'
import dependencyApp from './dependency/app.js'

t.plan(22)

const app = fastify()

app.register(dependencyApp)

app.ready(function (err) {
  t.error(err)

  app.inject({
    url: '/plugin-a'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { data: 'plugin-a' })
  })

  app.inject({
    url: '/plugin-b'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { data: 'plugin-b' })
  })

  app.inject({
    url: '/plugin-c'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { data: 'plugin-c' })
  })

  app.inject({
    url: '/plugin-d'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { data: 'plugin-d' })
  })

  app.inject({
    url: '/plugin-e'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { data: 'plugin-e' })
  })

  app.inject({
    url: '/plugin-f'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload), { data: 'plugin-f' })
  })

  app.inject({
    url: '/plugin-g'
  }, function (err, res) {
    t.error(err)
    t.equal(res.statusCode, 200)
    t.same(JSON.parse(res.payload).path, '/plugin-g')
  })
})
