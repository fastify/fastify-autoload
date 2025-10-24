import { describe, test } from 'node:test'
import assert from 'node:assert'
import fastify from 'fastify'

import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import fastifyAutoLoad from '../../index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

describe('typescript/basic test suite', function () {
  const app = fastify()

  test('should load routes and respond correctly', async function () {
    app.register(fastifyAutoLoad, { dir: resolve(__dirname, 'app'), forceESM: true })
    await app.ready()

    const res = await app.inject({ url: '/installed' })
    assert.strictEqual(res.statusCode, 200)
    assert.deepStrictEqual(JSON.parse(res.payload), { result: 'ok' })

    await app.close()
  })
})
