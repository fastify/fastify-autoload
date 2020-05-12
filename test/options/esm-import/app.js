import path from 'path'
import fastifyUrlData from 'fastify-url-data'
import AutoLoad from '../../index.js'

const currentDir = path.dirname((new URL(import.meta.url)).pathname)

export default function (fastify, opts, next) {
  fastify.register(fastifyUrlData)

  fastify.register(AutoLoad, {
    dir: currentDir,
    esmModules: true,
  })

  next()
}
