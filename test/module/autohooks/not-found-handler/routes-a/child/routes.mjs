'use strict'

export default async function (app) {
  app.get('/', async function (req, reply) {
    reply.send()
  })
}
