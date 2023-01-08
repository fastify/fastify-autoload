'use strict'

import { describe, test, expect } from 'vitest'
import Fastify from 'fastify'
import AutoLoad from '../../index'
import { join } from 'path'

describe.concurrent("Vitest test suite", function () {
  const app = Fastify()
    app.register(AutoLoad, {
      dir: join(__dirname, '../commonjs/ts-node/routes')
    })

  test("Test the root route", async function () {
    const response = await app.inject({
      method: 'GET',
      url: '/'
    })
    expect(response.statusCode).toEqual(200)
    expect(JSON.parse(response.payload)).toEqual({ hello: 'world' })
  })

  test("Test /foo route", async function () {
    const response = await app.inject({
      method: 'GET',
      url: '/foo'
    })
    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.payload)).toEqual({ foo: 'foo' })
  })
})
