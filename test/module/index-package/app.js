import url from 'url'
import path from 'path'
import fastifyAutoload from '../../../index.js'

export default function (fastify, opts, next) {
  fastify.register(fastifyAutoload, {
    dir: path.dirname(url.fileURLToPath(import.meta.url))
  })

  next()
}

export const autoload = false
