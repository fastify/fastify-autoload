import path from 'path'
import autoLoad from '../../../index.js'
import { fileURLToPath } from 'url'

const { dirname } = path
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default async function (fastify) {
  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'not-found-handler/routes-a'),
    autoHooks: true,
    cascadeHooks: true,
    options: { foo: 'bar' }
  })

  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'not-found-handler/routes-b'),
    autoHooks: true,
    cascadeHooks: true,
    options: { foo: 'bar', prefix: 'custom-prefix' }
  })
}
