import fs from 'fs'
import path from 'path'
import autoLoad from '../../../index.js'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default function (fastify, opts, next) {
  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'foo'),
    options: { foo: 'bar' },
    ignorePattern: /^ignored/
  })

  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'defaultPrefix'),
    options: { prefix: '/defaultPrefix' }
  })

  const skipDir = path.join(__dirname, 'skip')
  fs.mkdir(path.join(skipDir, 'empty'), () => {
    fastify.register(autoLoad, {
      dir: skipDir
    })

    next()
  })
}
