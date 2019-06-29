import * as path from 'path'
import * as AutoLoad from '../..'

import { FastifyPlugin } from './fastify-aliases'

export const App: FastifyPlugin = function (fastify, opts, next): void {
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'foo'),
    includeTypeScript: true
  })

  next()
}
