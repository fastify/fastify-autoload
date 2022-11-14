/* eslint no-redeclare: off */
/* eslint no-unused-vars: off */

import { FastifyPluginCallback, FastifyPluginOptions } from 'fastify'

type RewritePrefix = (folderParent: string, folderName: string) => string | boolean

type FastifyAutoloadPlugin = FastifyPluginCallback<NonNullable<fastifyAutoload.AutoloadPluginOptions>>
  
declare namespace fastifyAutoload {
  export interface AutoloadPluginOptions {
    dir: string
    dirNameRoutePrefix?: boolean | RewritePrefix
    ignorePattern?: RegExp
    scriptPattern?: RegExp
    indexPattern?: RegExp
    options?: FastifyPluginOptions
    maxDepth?: number
    forceESM?: boolean
    encapsulate?: boolean
    autoHooks?: boolean
    autoHooksPattern?: RegExp
    cascadeHooks?: boolean
    overwriteHooks?: boolean
    routeParams?: boolean
  }

  export const fastifyAutoload: FastifyAutoloadPlugin
  export { fastifyAutoload as default };
}

declare function fastifyAutoload(
  ...params: Parameters<FastifyAutoloadPlugin>
): ReturnType<FastifyAutoloadPlugin>;

export = fastifyAutoload;
