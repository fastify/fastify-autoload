'use strict'

import { describe, test, expect } from 'vitest'
import Fastify from 'fastify'
import AutoLoad from '../../index'
import { join } from 'path'

describe.concurrent('Vitest ignore filters test suite', function () {
  const app = Fastify()
  app.register(AutoLoad, {
    dir: join(__dirname, '../commonjs/ts-node/routes'),
    ignoreFilter: 'foo'
  })

  test('Test the root route', async function () {
    const response = await app.inject({
      method: 'GET',
      url: '/'
    })
    expect(response.statusCode).toEqual(200)
  })

  test('Test /foo route', async function () {
    const response = await app.inject({
      method: 'GET',
      url: '/foo'
    })
    expect(response.statusCode).toBe(404)
  })

  test('Test /bar route', async function () {
    const response = await app.inject({
      method: 'GET',
      url: '/bar'
    })
    expect(response.statusCode).toBe(200)
  })

  test('Test /baz route', async function () {
    const response = await app.inject({
      method: 'GET',
      url: '/foo/baz'
    })
    expect(response.statusCode).toBe(404)
  })
})

describe.concurrent('Vitest match filters test suite', function () {
  const app = Fastify()
  app.register(AutoLoad, {
    dir: join(__dirname, '../commonjs/ts-node/routes'),
    matchFilter: (path) => path.startsWith('/foo')
  })

  test('Test the root route', async function () {
    const response = await app.inject({
      method: 'GET',
      url: '/'
    })
    expect(response.statusCode).toEqual(404)
  })

  test('Test /foo route', async function () {
    const response = await app.inject({
      method: 'GET',
      url: '/foo'
    })
    expect(response.statusCode).toBe(200)
  })

  test('Test /bar route', async function () {
    const response = await app.inject({
      method: 'GET',
      url: '/bar'
    })
    expect(response.statusCode).toBe(404)
  })

  test('Test /baz route', async function () {
    const response = await app.inject({
      method: 'GET',
      url: '/foo/baz/customPath'
    })
    expect(response.statusCode).toBe(200)
  })
})

describe.concurrent('Vitest match filters without prefix test suite', function () {
  const app = Fastify()
  app.register(AutoLoad, {
    dir: join(__dirname, '../commonjs/ts-node/routes'),
    dirNameRoutePrefix: false,
    matchFilter: (path) => path.startsWith('/foo/baz')
  })

  test('Test /baz route', async function () {
    const response = await app.inject({
      method: 'GET',
      url: '/customPath'
    })
    expect(response.statusCode).toBe(200)
  })
})
