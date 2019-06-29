import { FastifyPlugin } from '../../fastify-aliases'

import { DeepThought } from './deep-thought'

const TSPlugin: FastifyPlugin = function (f, opts, next): void {
  f.get('/package', (request, reply): void => {
    reply.send({ answer: DeepThought.getAnswer() })
  })

  next()
}

export = TSPlugin
