import path from 'path'
import { fileURLToPath } from 'url'

import autoload from '../../../index.js'

const { dirname } = path
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default async function (fastify, opts) {
  fastify.register(autoload, {
    dir: path.join(__dirname, 'routes'),
    routeParams: true
  })
}
