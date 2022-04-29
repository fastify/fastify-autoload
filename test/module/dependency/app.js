import path, { dirname } from 'path'
import fastifyUrlData from '@fastify/url-data'
import autoLoad from '../../../index.js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default function (fastify, opts, next) {
  fastify.register(fastifyUrlData)

  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'plugins')
  })

  next()
}
