import { Plugin, RegisterOptions } from 'fastify'
import { Server, IncomingMessage, ServerResponse} from 'http'
declare namespace fastifyAutoload {
    interface PluginOptions extends RegisterOptions<Server, IncomingMessage, ServerResponse> {
        dir?: string
        ignorePattern?: string
    }
}

declare const fastifyAutoload: Plugin<Server, IncomingMessage, ServerResponse, fastifyAutoload.PluginOptions>;

export = fastifyAutoload
