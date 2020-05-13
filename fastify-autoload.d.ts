/* eslint no-redeclare: off */
/* eslint no-unused-vars: off */

import { FastifyPlugin, FastifyPluginOptions } from 'fastify'

export interface AutoloadPluginOptions {
  dir: string
  ignorePattern?: RegExp | string
  includeTypeScript?: boolean
  loadESM?: boolean
  options?: FastifyPluginOptions
}

declare const fastifyAutoload: FastifyPlugin<AutoloadPluginOptions>

export default fastifyAutoload
