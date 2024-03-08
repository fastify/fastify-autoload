export default async function (app) {
  app.setNotFoundHandler((request, reply) => {
    reply.code(404)
      .header('from', 'routes-a/child')
      .send()
  });
}
