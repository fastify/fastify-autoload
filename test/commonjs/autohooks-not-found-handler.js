'use strict'

const t = require('tap')
const Fastify = require('fastify')

const app = Fastify()

app.register(require('./autohooks/not-found-handler'))

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
    t.equal(res.headers.from, 'routes-a')

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
