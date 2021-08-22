import t from 'tap'
import fastify from 'fastify'
import indexPackage from './index-package/app.js'

t.test('index package', async () => {
  const app = fastify()

  app.register(indexPackage)

  const res = await app.inject('/foo/bar')

  t.equal(res.statusCode, 200)
  t.same(res.json(), { success: true })
})
