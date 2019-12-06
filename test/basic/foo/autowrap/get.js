module.exports = {
  method: 'GET',
  url: '/:id',
  handler: (request, reply) => {
    reply.send({ answer: 42 })
  }
}
