import fastify, { FastifyInstance, FastifyPlugin } from 'fastify'
import { expectType } from 'tsd'
import * as fastifyAutoloadStar from "../../../"
import fastifyAutoloadDefault, { AutoloadPluginOptions, fastifyAutoload as fastifyAutoloadNamed } from "../../../"

import fastifyAutoloadCjsImport = require("../../../")
const fastifyAutoloadCjs = require("../../../")

const app: FastifyInstance = fastify();
app.register(fastifyAutoloadNamed);
app.register(fastifyAutoloadDefault);
app.register(fastifyAutoloadCjs);
app.register(fastifyAutoloadCjsImport.default);
app.register(fastifyAutoloadCjsImport.fastifyAutoload);
app.register(fastifyAutoloadStar.default);
app.register(fastifyAutoloadStar.fastifyAutoload);

expectType<FastifyPlugin<AutoloadPluginOptions>>(fastifyAutoloadNamed);
expectType<FastifyPlugin<AutoloadPluginOptions>>(fastifyAutoloadDefault);
expectType<FastifyPlugin<AutoloadPluginOptions>>(fastifyAutoloadCjsImport.default);
expectType<FastifyPlugin<AutoloadPluginOptions>>(fastifyAutoloadCjsImport.fastifyAutoload);
expectType<FastifyPlugin<AutoloadPluginOptions>>(fastifyAutoloadStar.default);
expectType<FastifyPlugin<AutoloadPluginOptions>>(fastifyAutoloadStar.fastifyAutoload);
expectType<any>(fastifyAutoloadCjs);

let opt1: AutoloadPluginOptions = {
  dir: 'test'
}
const opt2: AutoloadPluginOptions = {
  dir: 'test',
  ignorePattern: /skip/
}
const opt3: AutoloadPluginOptions = {
  dir: 'test',
  scriptPattern: /js/,
  indexPattern: /index/,
}
const opt4: AutoloadPluginOptions = {
  dir: 'test',
  options: {
    prefix: 'test'
  }
}
const opt5: AutoloadPluginOptions = {
  dir: 'test',
  maxDepth: 1,
}
const opt6: AutoloadPluginOptions = {
  dir: 'test',
  routeParams: true,
}
const opt7: AutoloadPluginOptions = {
  dir: 'test',
  forceESM: true,
  autoHooks: true,
  autoHooksPattern: /^[_.]?auto_?hooks(\.js|\.cjs|\.mjs)$/i,
  cascadeHooks: true,
  overwriteHooks: true,
}
app.register(fastifyAutoloadDefault, opt1)
app.register(fastifyAutoloadDefault, opt2)
app.register(fastifyAutoloadDefault, opt3)
app.register(fastifyAutoloadDefault, opt4)
app.register(fastifyAutoloadDefault, opt5)
app.register(fastifyAutoloadDefault, opt6)
app.register(fastifyAutoloadDefault, opt7)
