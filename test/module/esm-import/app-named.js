import path from 'path'
import { fileURLToPath } from 'url'

import { fastifyAutoload as fastifyAutoloadNamed } from '../../../index.js'

const { dirname } = path
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default async function (fastify, opts) {
  fastify.register(fastifyAutoloadNamed, {
    dir: path.join(__dirname, 'plugins', 'named'),
    options: { foo: 'bar' }
  })
}
