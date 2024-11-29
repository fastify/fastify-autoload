import { FastifyPluginCallback, FastifyPluginOptions } from 'fastify'

type FastifyAutoloadPlugin = FastifyPluginCallback<NonNullable<fastifyAutoload.AutoloadPluginOptions>>

declare namespace fastifyAutoload {
  type RewritePrefix = (folderParent: string, folderName: string) => string | boolean
  type Filter = string | RegExp | ((path: string) => boolean)

  export interface AutoloadPluginOptions {
    dir: string
    dirNameRoutePrefix?: boolean | RewritePrefix
    ignoreFilter?: Filter
    matchFilter?: Filter
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
  export { fastifyAutoload as default }
}

declare function fastifyAutoload (
  ...params: Parameters<FastifyAutoloadPlugin>
): ReturnType<FastifyAutoloadPlugin>

export = fastifyAutoload
