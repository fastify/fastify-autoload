import { FastifyPlugin } from '../../fastify-aliases'

import { DeepThought } from './answer'

const TSPlugin: FastifyPlugin = function(f, opts, next) {
    f.get('/answer', (request, reply) => {
        reply.send({ answer: DeepThought.getAnswer() })
    })
    
    next()
}

export = TSPlugin
