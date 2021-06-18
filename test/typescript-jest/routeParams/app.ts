import { FastifyPlugin } from 'fastify';
import { join } from 'path';
const fastifyAutoLoad = require('../../../');

const app: FastifyPlugin = function (fastify, opts, next): void {
  fastify.register(fastifyAutoLoad, {
    dir: join(__dirname, 'foo'),
    routeParams: true,
  });

  next();
};

export default app;
