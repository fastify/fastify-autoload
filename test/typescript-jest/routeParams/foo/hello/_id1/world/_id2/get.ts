import { FastifyPlugin } from 'fastify';

const plugin: FastifyPlugin = function (fastify, opts, next): void {
  fastify.get('/', (request, reply): void => {
    const { id1, id2 } = request.params as { id1: number; id2: number };

    reply.send({ id1, id2 });
  });

  next();
};

export default plugin;
