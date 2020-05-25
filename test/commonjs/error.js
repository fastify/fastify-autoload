'use strict'

const t = require('tap')
const fastify = require('fastify')

t.plan(6)

const app = Fastify()

app.register(require('./syntax-error/app'))

app.ready(function (err) {
  t.type(err, SyntaxError)
  t.match(err.message, /unexpected token/i)
})

const app2 = Fastify()

app2.register(require('./index-error/app'))

app2.ready(function (err) {
  t.type(err, Error)
  t.match(err.message, /cannot import plugin.*index/i)
})

const app3 = Fastify()

app3.register(require('./ts-error/app'))

app3.ready(function (err) {
  t.type(err, Error)
  t.match(err.message, /cannot import plugin.*typescript/i)
})
