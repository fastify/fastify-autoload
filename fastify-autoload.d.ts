/* eslint no-redeclare: off */
/* eslint no-unused-vars: off */

import { FastifyPlugin, FastifyPluginOptions } from 'fastify'

export interface AutoloadPluginOptions {
  dir: string
  ignorePattern?: RegExp
  scriptPattern?: RegExp
  indexPattern?: RegExp
  options?: FastifyPluginOptions
}

declare const fastifyAutoload: FastifyPlugin<AutoloadPluginOptions | AutoloadPluginOptions[]>

export default fastifyAutoload
