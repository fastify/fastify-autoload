'use strict'

const t = require('tap')
const Fastify = require('fastify')

t.plan(2)

const app = Fastify()

app.register(require('./error/app'))

app.ready(function (err) {
  t.type(err, SyntaxError)
  t.match(err.message, /Unexpected token \} at .*\/test\/error\/lib\/a.js:6/)
})
