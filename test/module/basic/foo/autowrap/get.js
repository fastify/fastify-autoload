export default {
  method: 'GET',
  url: '/:id',
  handler: (request, reply) => {
    reply.send({ answer: 42 })
  }
}
