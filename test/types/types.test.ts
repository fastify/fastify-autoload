import autoload, { AutoloadPluginOptions } from '../../fastify-autoload'
import fastify from 'fastify'

const app = fastify()
let opt1: AutoloadPluginOptions = {
  dir: 'test'
}
const opt2: AutoloadPluginOptions = {
  dir: 'test',
  ignorePattern: /skip/
}
const opt3: AutoloadPluginOptions = {
  dir: 'test',
  includeTypeScript: true
}
const opt4: AutoloadPluginOptions = {
  dir: 'test',
  options: {
    prefix: 'test'
  }
}
app.register(autoload, opt1)
app.register(autoload, opt2)
app.register(autoload, opt3)
app.register(autoload, opt4)
