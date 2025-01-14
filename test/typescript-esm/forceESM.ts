import fastify from 'fastify'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import fastifyAutoLoad from '../../'

const __dirname = dirname(fileURLToPath(import.meta.url))

describe('Node test suite for ESM', function () {
  const app = fastify()

  app.register(fastifyAutoLoad, { dir: resolve(__dirname, 'app'), forceESM: true })

  it('should load routes and respond correctly', function (done) {
    app.ready(function (err): void {
      assert.ifError(err)

      app.inject(
        {
          url: '/installed'
        },
        function (err, res: any): void {
          assert.ifError(err)
          assert.strictEqual(res.statusCode, 200)
          assert.deepStrictEqual(JSON.parse(res.payload), { result: 'ok' })
        }
      )
    })
  })
})
