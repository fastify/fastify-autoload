module.exports = async function (app) {
  app.setNotFoundHandler((request, reply) => {
    reply.code(404)
      .header('from', 'routes-b')
      .send()
  });
}
