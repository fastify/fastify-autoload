import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import fastifyAutoloadDefault from '../../../index.js'

export default async function (fastify, opts) {
  fastify.register(fastifyAutoloadDefault, {
    dir: path.join(__dirname, 'plugins', 'default'),
    options: { foo: 'bar' }
  })
}
