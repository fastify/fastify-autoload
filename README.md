# fastify-autoload

Convenience plugin for Fastify that loads all plugins found in a directory and automatically configures routes matching the folder structure.

## Installation

```
npm i --save fastify fastify-autoload
```

## Example

Fastify server that automatically loads in all plugins from the `plugins` directory:

```js
const fastify = require('fastify')
const fastifyAutoload = require('fastify-autoload')

const app = fastify()

app.register(fastifyAutoload, {
  dir: path.join(__dirname, 'plugins')
})

app.listen(3000)
```

Folder structure:

```
├── plugins
│   ├── single-plugin
│   │   ├── index.js
│   │   └── utils.js
│   ├── more-plugins
│   │   ├── commonjs.cjs
│   │   ├── module.mjs
│   │   └── typescript.ts
│   └── another-plugin.js
├── package.json
└── app.js
```

## Global Configuration

Autoload can be customised using the following options:

- `dir` (required) - Base directory containing plugins to be loaded

  Each script file within a directory is treated as a plugin unless the directory contains an index file (e.g. `index.js`). In that case only the index file will be loaded.
  
  The following script types are supported:

  - `.js ` (CommonJS or ES modules depending on `type` field of parent `package.json`)
  - `.cjs` (CommonJS)
  - `.mjs` (ES modules)
  - `.ts` (TypeScript)

- `ignorePattern` (optional) - Regex matching any file that should not be loaded

  ```js
  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'plugins'),
    ignorePattern: /.*(test|spec).js/
  })
  ```

- `options` (optional) - Global options object used for all registered plugins

  Any option specified here will override `plugin.autoConfig` options specified in the plugin itself.

  When setting both `options.prefix` and `plugin.autoPrefix` they will be concatenated.

  ```js
  // index.js
  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: { prefix: '/defaultPrefix' }
  })

  // /plugins/something.js
  module.exports = function (fastify, opts, next) {
    // your plugin
  }

  module.exports.autoPrefix = '/something'

  // routes can now be added to /defaultPrefix/something
  ```

## Plugin Configuration

Each plugin can be individually configured using the following module properties:

- `plugin.autoConfig` - Configuration object which will be used as `opts` parameter

  ```js
  module.exports = function (fastify, opts, next) {
    console.log(opts.foo) // 'bar'
    next()
  }

  module.exports.autoConfig = { foo: 'bar' }
  ```

- `plugin.autoPrefix` - Set routing prefix for plugin

  ```js
  module.exports = function (fastify, opts, next) {
    fastify.get('/', (request, reply) => {
      reply.send({ hello: 'world' })
    })

    next()
  }

  module.exports.autoPrefix = '/something'

  // when loaded with autoload, this will be exposed as /something
  ```
  
- `plugin.prefixOverride` - Override all other prefix option

  ```js
  // index.js
  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: { prefix: '/defaultPrefix' }
  })

  // /foo/something.js
  module.exports = function (fastify, opts, next) {
    // your plugin
  }

  module.exports.prefixOverride = '/overriddenPrefix'

  // this will be exposed as /overriddenPrefix
  ```

  If you have a plugin in the folder you don't want the any prefix applied to, you can set `prefixOverride = ''`:

  ```js
  // index.js
  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: { prefix: '/defaultPrefix' }
  })

  // /foo/something.js
  module.exports = function (fastify, opts, next) {
    // your plugin
  }

  // optional
  module.exports.prefixOverride = ''

  // routes can now be added without a prefix
  ```

- `plugin.autoload` - Toggle whether the plugin should be loaded

  Example:
  
  ```js
  module.exports = function (fastify, opts, next) {
    // your plugin
  }

  // optional
  module.exports.autoload = false
  ```

- `opts.name` - Set name of plugin so that it can be referenced as a dependency

- `opts.dependencies` - Set plugin dependencies to ensure correct load order

  Example:

  ```js
  // plugins/plugin-a.js
  const fp = require('fastify-plugin')

  function plugin (fastify, opts, next) {
    // plugin a
  }

  module.exports = fp(plugin, {
    name: 'plugin-a',
    dependencies: ['plugin-b']
  })
  
  // plugins/plugin-b.js
  function plugin (fastify, opts, next) {
    // plugin b
  }

  module.exports = fp(plugin, {
    name: 'plugin-b'
  })
  ```

## License

MIT
