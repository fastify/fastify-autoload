import * as t from 'tap'
import * as Fastify from 'fastify'

import { App } from './typescript/app'

t.plan(10)

const app = Fastify()

app.register(App)

app.ready(function (err) {
    t.error(err)

    app.inject({
        url: '/javascript'
    }, function (err, res) {
        t.error(err)
        t.equal(res.statusCode, 200)
        t.deepEqual(JSON.parse(res.payload), { script: 'java' })
    })

    app.inject({
        url: '/typescript'
    }, function (err, res) {
        t.error(err)
        t.equal(res.statusCode, 200)
        t.deepEqual(JSON.parse(res.payload), { script: 'type' })
    })

    app.inject({
        url: '/answer'
    }, function (err, res) {
        t.error(err)
        t.equal(res.statusCode, 200)
        t.deepEqual(JSON.parse(res.payload), { answer: 42 })
    })
})
