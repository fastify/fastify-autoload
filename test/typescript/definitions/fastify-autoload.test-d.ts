import fastify, { FastifyInstance, FastifyPluginCallback } from 'fastify'
import { expectType } from 'tsd'
import * as fastifyAutoloadStar from '../../../'
import fastifyAutoloadDefault, { AutoloadPluginOptions, fastifyAutoload as fastifyAutoloadNamed } from '../../../'

import fastifyAutoloadCjsImport = require('../../../')
const fastifyAutoloadCjs = require('../../../')

const app: FastifyInstance = fastify();
app.register(fastifyAutoloadNamed);
app.register(fastifyAutoloadDefault);
app.register(fastifyAutoloadCjs);
app.register(fastifyAutoloadCjsImport.default);
app.register(fastifyAutoloadCjsImport.fastifyAutoload);
app.register(fastifyAutoloadStar.default);
app.register(fastifyAutoloadStar.fastifyAutoload);

expectType<FastifyPluginCallback<AutoloadPluginOptions>>(fastifyAutoloadNamed);
expectType<FastifyPluginCallback<AutoloadPluginOptions>>(fastifyAutoloadDefault);
expectType<FastifyPluginCallback<AutoloadPluginOptions>>(fastifyAutoloadCjsImport.default);
expectType<FastifyPluginCallback<AutoloadPluginOptions>>(fastifyAutoloadCjsImport.fastifyAutoload);
expectType<FastifyPluginCallback<AutoloadPluginOptions>>(fastifyAutoloadStar.default);
expectType<FastifyPluginCallback<AutoloadPluginOptions>>(fastifyAutoloadStar.fastifyAutoload);
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
const opt8: AutoloadPluginOptions = {
  dir: 'test',
  encapsulate: false,
}
app.register(fastifyAutoloadDefault, opt1)
app.register(fastifyAutoloadDefault, opt2)
app.register(fastifyAutoloadDefault, opt3)
app.register(fastifyAutoloadDefault, opt4)
app.register(fastifyAutoloadDefault, opt5)
app.register(fastifyAutoloadDefault, opt6)
app.register(fastifyAutoloadDefault, opt7)
app.register(fastifyAutoloadDefault, opt8)