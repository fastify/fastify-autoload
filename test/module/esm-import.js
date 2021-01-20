import t from 'tap'
import fastify from 'fastify'
import esmImportApp from './esm-import/app.js'

t.plan(13)

const app = fastify()

app.register(esmImportApp)

app.ready(function (err) {
  t.error(err)

  app.inject({
    url: '/named'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.deepEqual(JSON.parse(res.payload), { script: 'named' })
  })

  app.inject({
    url: '/default'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.deepEqual(JSON.parse(res.payload), { script: 'default' })
  })

  app.inject({
    url: '/star-default'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.deepEqual(JSON.parse(res.payload), { script: 'star-default' })
  })
  app.inject({
    url: '/star-named'
  }, function (err, res) {
    t.error(err)

    t.equal(res.statusCode, 200)
    t.deepEqual(JSON.parse(res.payload), { script: 'star-named' })
  })
})
