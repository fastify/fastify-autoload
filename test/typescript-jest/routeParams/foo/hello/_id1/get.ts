import { FastifyPlugin } from 'fastify';

const plugin: FastifyPlugin = function (fastify, opts, next): void {
  fastify.get('/', (request, reply): void => {
    const { id1 } = request.params as { id1: number };

    reply.send({ id1 });
  });

  next();
};

export default plugin;
