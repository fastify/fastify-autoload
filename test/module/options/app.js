import path from 'path'
import fastifyUrlData from '@fastify/url-data'
import { fileURLToPath } from 'url'
import autoLoad from '../../../index.js'

const { dirname } = path
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default function (fastify, opts, next) {
  fastify.register(fastifyUrlData)

  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: {
      b: 'override'
    }
  })

  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'plugins-2')
  })

  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'plugins-3')
  })

  next()
}
