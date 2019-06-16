import { FastifyPlugin } from '../fastify-aliases'

const TSPlugin: FastifyPlugin = function(f, opts, next) {
    f.get('/typescript', (request, reply) => {
        reply.send({ script: 'type' })
    })
    
    next()
}

export = TSPlugin
