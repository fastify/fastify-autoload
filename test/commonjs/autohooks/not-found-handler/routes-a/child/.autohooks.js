module.exports = function (app, opts, next) {
  app.setNotFoundHandler((request, reply) => {
    reply.code(404)
      .header('from', 'routes-a')
      .send()
  });

  next()
}
