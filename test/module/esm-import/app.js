import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { fastifyAutoload as fastifyAutoloadNamed } from "../../../index.js"
import fastifyAutoloadDefault from '../../../index.js'
import * as fastifyAutoloadStar from '../../../index.js'

export default async function (fastify, opts) {
  fastify.register(fastifyAutoloadNamed, {
    dir: path.join(__dirname, 'plugins', 'named'),
    options: { foo: 'bar' }
  })

  fastify.register(fastifyAutoloadDefault, {
    dir: path.join(__dirname, 'plugins', 'default'),
    options: { foo: 'bar' }
  })

  fastify.register(fastifyAutoloadStar.default, {
    dir: path.join(__dirname, 'plugins', 'star-default'),
    options: { foo: 'bar' }
  })
  fastify.register(fastifyAutoloadStar.fastifyAutoload, {
    dir: path.join(__dirname, 'plugins', 'star-named'),
    options: { foo: 'bar' }
  })
}
