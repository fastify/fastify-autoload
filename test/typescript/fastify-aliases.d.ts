import { RegisterOptions, Plugin } from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'

type PluginOptions = RegisterOptions<Server, IncomingMessage, ServerResponse>
type FastifyPlugin<T = PluginOptions> = Plugin<Server, IncomingMessage, ServerResponse, T>
