import path from 'node:path'
import { fileURLToPath } from 'node:url'

import fastifyAutoloadDefault from '../../../index.js'

const { dirname } = path
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default async function (fastify, opts) {
  fastify.register(fastifyAutoloadDefault, {
    dir: path.join(__dirname, 'plugins', 'default'),
    options: { foo: 'bar' }
  })
}
