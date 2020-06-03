import list from './list.js'
import get from './get.js'

export default function (fastify, opts, next) {
  fastify.register(list)
  fastify.register(get)

  next()
}

export const autoPrefix = '/semiautomatic'
