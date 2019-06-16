import { FastifyPlugin } from '../../fastify-aliases'

import { DeepThought } from './deep-thought'

const TSPlugin: FastifyPlugin = function(f, opts, next) {
    f.get('/package', (request, reply) => {
        reply.send({ answer: DeepThought.getAnswer() })
    })
    
    next()
}

export = TSPlugin
