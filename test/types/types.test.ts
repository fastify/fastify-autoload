import * as autoload from '../../fastify-autoload'
import * as fastify from 'fastify'

const app = fastify()
let opt1: autoload.PluginOptions = {
  dir: 'test'
}
const opt2: autoload.PluginOptions = {
  dir: 'test',
  ignorePattern: /skip/
}
const opt3: autoload.PluginOptions = {
  dir: 'test',
  includeTypeScript: true
}
const opt4: autoload.PluginOptions = {
  dir: 'test',
  options: {
    prefix: 'test'
  }
}
app.register(autoload, opt1)
app.register(autoload, opt2)
app.register(autoload, opt3)
app.register(autoload, opt4)
