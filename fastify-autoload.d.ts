/* eslint no-redeclare: off */
/* eslint no-unused-vars: off */

import { FastifyPlugin, FastifyPluginOptions } from 'fastify'

export interface AutoloadPluginOptions {
  dir: string
  dirNameRoutePrefix?: boolean | RewritePrefix
  ignorePattern?: RegExp
  scriptPattern?: RegExp
  indexPattern?: RegExp
  options?: FastifyPluginOptions
  maxDepth?: number
}

declare const fastifyAutoload: FastifyPlugin<AutoloadPluginOptions>

type RewritePrefix = (folderParent: string, folderName: string) => string | boolean

export default fastifyAutoload
