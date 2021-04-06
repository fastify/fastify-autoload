'use strict'

const t = require('tap')
const Fastify = require('fastify')

t.plan(1)

const app = Fastify()

app.register(require('./cyclic-dependency/app'))

app.ready(function (err) {
  t.equal(err.message, 'Cyclic dependency')
})
