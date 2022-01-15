import fastify from 'fastify'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import t from 'tap'
import fastifyAutoLoad from '../../'

t.plan(4)

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = fastify()

app.register(fastifyAutoLoad, { dir: resolve(__dirname, 'app'), forceESM: true })

app.ready(function (err): void {
  t.error(err)

  app.inject(
    {
      url: '/installed'
    },
    function (err, res): void {
      t.error(err)
      t.equal(res.statusCode, 200)
      t.same(JSON.parse(res.payload), { result: 'ok' })
    }
  )
})
