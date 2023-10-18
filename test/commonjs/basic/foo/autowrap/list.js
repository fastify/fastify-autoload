'use strict'

module.exports = {
  method: 'GET',
  url: '/',
  handler: (request, reply) => {
    reply.send([{ answer: 42 }, { answer: 41 }])
  }
}
