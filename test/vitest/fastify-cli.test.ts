'use strict'

import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import fastify, {FastifyInstance} from 'fastify'
import buildApp from './basic/app'

let server: FastifyInstance

beforeEach(async () => {
  server = await buildApp(fastify(), {})
  await server.ready()
})
afterEach(async () => {
  // called once after all tests run
  await server.close()
})

describe("vitest test suite using fastify-cli startup", function () {

  test("Test the root route", async function () {
    const response = await server.inject({
      method: 'GET',
      url: '/'
    })
    expect(response.statusCode).toEqual(200)
    expect(JSON.parse(response.payload)).toEqual({ hello: 'world' })
  })

  test("Test /foo route", async function () {
    const response = await server.inject({
      method: 'GET',
      url: '/foo'
    })
    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.payload)).toEqual({ foo: 'foo' })
  })
})
