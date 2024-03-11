'use strict'

const { test } = require('tap')
const Fastify = require('fastify')
const autoload = require('../../..')
const path = require('path')

test('Should throw an error when trying to load invalid hooks', t => {
  t.plan(1)

  const app = Fastify()

  app.register(autoload, {
    dir: path.join(__dirname, 'routes'),
    autoHooks: true,
    autoHooksPattern: /^.invalid-autohooks.js$/iu
  })

  app.ready(function (err) {
    t.ok(err.message.includes('Unexpected identifier at ' + path.join(__dirname, 'routes/.invalid-autohooks.js')))
  })
})
