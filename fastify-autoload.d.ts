/* eslint no-redeclare: off */
/* eslint no-unused-vars: off */

import { Plugin, RegisterOptions } from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'

declare namespace fastifyAutoload {
  interface PluginOptions {
    dir: string
    ignorePattern?: RegExp | string
    includeTypeScript?: boolean
    options?: RegisterOptions<Server, IncomingMessage, ServerResponse>
  }
}

declare const fastifyAutoload: Plugin<Server, IncomingMessage, ServerResponse, fastifyAutoload.PluginOptions>

export = fastifyAutoload
