# fastify-autoload

![CI workflow](https://github.com/fastify/fastify-autoload/workflows/ci/badge.svg)
[![NPM version](https://img.shields.io/npm/v/fastify-autoload.svg?style=flat)](https://www.npmjs.com/package/fastify-autoload)
[![Known Vulnerabilities](https://snyk.io/test/github/fastify/fastify-autoload/badge.svg)](https://snyk.io/test/github/fastify/fastify-autoload)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://standardjs.com/)

Convenience plugin for Fastify that loads all plugins found in a directory and automatically configures routes matching the folder structure.

## Installation

```
npm i fastify-autoload
```

## Example

Fastify server that automatically loads in all plugins from the `plugins` directory:

```js
const fastify = require('fastify')
const autoload = require('fastify-autoload')

const app = fastify()

app.register(autoload, {
  dir: path.join(__dirname, 'plugins')
})

app.listen(3000)
```

or with ESM syntax:

```js
import autoLoad from 'fastify-autoload'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fastify from 'fastify'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = fastify()

app.register(autoLoad, {
  dir: join(__dirname, 'plugins')
})

app.listen(3000)
```

Folder structure:

```
├── plugins
│   ├── hooked-plugin
│   │   ├── autohooks.mjs
│   │   ├── routes.js
│   │   └── children
│   │       ├── commonjs.cjs
│   │       ├── module.mjs
│   │       └── typescript.ts
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

  Each script file within a directory is treated as a plugin unless the directory contains an index file (e.g. `index.js`). In that case only the index file (and the potential sub-directories) will be loaded.

  The following script types are supported:

  - `.js ` (CommonJS or ES modules depending on `type` field of parent `package.json`)
  - `.cjs` (CommonJS)
  - `.mjs` (ES modules)
  - `.ts` (TypeScript)

- `dirNameRoutePrefix` (optional) - Default: true. Determines whether routes will be automatically prefixed with the subdirectory name in an autoloaded directory. It can be a sync function that must return a string that will be used as prefix, or it must return `false` to skip the prefix for the directory.

  ```js
  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'routes'),
    dirNameRoutePrefix: false // lack of prefix will mean no prefix, instead of directory name
  })

  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'routes'),
    dirNameRoutePrefix: function rewrite (folderParent, folderName) {
      if (folderName === 'YELLOW') {
        return 'yellow-submarine'
      }
      if (folderName === 'FoOoO-BaAaR') {
        return false
      }
      return folderName
    }
  })
  ```


- `ignorePattern` (optional) - Regex matching any file that should not be loaded

  ```js
  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'plugins'),
    ignorePattern: /.*(test|spec).js/
  })
  ```

- `indexPattern` (optional) - Regex to override the `index.js` naming convention

  ```js
  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'plugins'),
    indexPattern: /.*routes(\.ts|\.js|\.cjs|\.mjs)$/
  })
  ```

- `maxDepth` (optional) - Limits the depth at which nested plugins are loaded

  ```js
  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'plugins'),
    maxDepth: 2 // files in `opts.dir` nested more than 2 directories deep will be ignored.
  })
  ```

- `forceESM` (optional) - If set to 'true' it always use `await import` to load plugins or hooks.

  ```js
  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'plugins'),
    forceESM: true
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

  // /plugins/something.mjs
  export default function (f, opts, next) {
    f.get('/', (request, reply) => {
      reply.send({ something: 'else' })
    })

    next()
  }

  export const autoPrefix = '/prefixed'

  // routes can now be added to /defaultPrefix/something
  ```

- `autoHooks` (optional) - Apply hooks from `autohooks.js` file(s) to plugins found in folder

  Automatic hooks from `autohooks` files will be encapsulated with plugins. If `false`, all `autohooks.js` files will be ignored.

  ```js
  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'plugins'),
    autoHooks: true // apply hooks to routes in this level
  })
  ```

  If `autoHooks` is set, all plugins in the folder will be [encapsulated](https://github.com/fastify/fastify/blob/master/docs/Encapsulation.md)
  and decorated values _will not be exported_ outside the folder.

- `autoHooksPattern` (optional) - Regex to override the `autohooks` naming convention

  ```js
  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'plugins'),
    autoHooks: true,
    autoHooksPattern: /^[_.]?auto_?hooks(\.js|\.cjs|\.mjs)$/i
  })
  ```

- `cascadeHooks` (optional) - If using `autoHooks`, cascade hooks to all children. Ignored if `autoHooks` is `false`.

  Default behaviour of `autoHooks` is to apply hooks only to the level on which the `autohooks.js` file is found. Setting `cascadeHooks: true` will continue applying the hooks to any children.

  ```js
  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'plugins'),
    autoHooks: true, // apply hooks to routes in this level,
    cascadeHooks: true // continue applying hooks to children, starting at this level    
  })
  ```

- `overwriteHooks` (optional) - If using `cascadeHooks`, cascade will be reset when a new `autohooks.js` file is encountered. Ignored if `autoHooks` is `false`.

  Default behaviour of `cascadeHooks` is to accumulate hooks as new `autohooks.js` files are discovered and cascade to children. Setting `overwriteHooks: true` will start a new hook cascade when new `autohooks.js` files are encountered.

  ```js
  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'plugins'),
    autoHooks: true, // apply hooks to routes in this level,
    cascadeHooks: true, // continue applying hooks to children, starting at this level,
    overwriteHooks: true // re-start hook cascade when a new `autohooks.js` file is found
  })
  ```

- `routeParams` (optional) - Folders prefixed with `_` will be turned into route parameters.

  ```js
  /*
  ├── routes
  │   └── users
  │       ├── _id
  │       │   └── actions.js
  │       └── index.js
  └── app.js
  */

  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'routes'),
    routeParams: true // routes/users/_id/actions.js will be loaded with prefix /users/:id
  })  

  // curl http://localhost:3000/users/index
  // { userIndex: [ { id: 7, username: 'example' } ] }

  // curl http://localhost:3000/users/7/details
  // { user: { id: 7, username: 'example' } }

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

  Or with ESM syntax:

  ```js
  import plugin from '../lib-plugin.js'

  export default async function myPlugin (app, options) {
    app.get('/', async (request, reply) => {
      retrun { hello: options.name }
    })
  }
  export const autoConfig = { name: 'y' }
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

  Or with ESM syntax:

  ```js
  export default async function (app, opts) {
    app.get('/', (request, reply) => {
      return { something: 'else' }
    })
  }

  export const autoPrefix = '/prefixed'
  ```


- `plugin.prefixOverride` - Override all other prefix options

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

  Or with ESM syntax:

  ```js
  export default async function (app, opts) {
    // your plugin
  }

  export const prefixOverride = '/overriddenPrefix'
  ```

  If you have a plugin in the folder you do not want any prefix applied to, you can set `prefixOverride = ''`:

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

  ## Autohooks:

  The autohooks functionality provides several options for automatically embedding hooks, decorators, etc. to your routes. CJS and ESM `autohook` formats are supported.
  
  The default behaviour of `autoHooks: true` is to encapsulate the `autohooks.js` plugin with the contents of the folder containing the file. The `cascadeHooks: true` option encapsulates the hooks with the current folder contents and all subsequent children, with any additional `autohooks.js` files being applied cumulatively. The `overwriteHooks: true` option will re-start the cascade any time an `autohooks.js` file is encountered.

  Plugins and hooks are encapsulated together by folder and registered on the `fastify` instance which loaded the `fastify-autoload` plugin. For more information on how encapsulation works in Fastify, see: https://www.fastify.io/docs/latest/Encapsulation/

    ### Example:

    ```
    ├── plugins
    │   ├── hooked-plugin
    │   │   ├── autohooks.js // req.hookOne = 'yes' # CJS syntax
    │   │   ├── routes.js
    │   │   └── children
    │   │       ├── old-routes.js
    │   │       ├── new-routes.js
    │   │       └── grandchildren
    │   │           ├── autohooks.mjs // req.hookTwo = 'yes' # ESM syntax
    │   │           └── routes.mjs
    │   └── standard-plugin
    │       └── routes.js
    └── app.js
    ```

    ```js
    // hooked-plugin/autohooks.js

    module.exports = async function (app, opts, next) {
      app.addHook('onRequest', async (req, reply) => {
        req.hookOne = yes;
        next();
      });
    }

    // hooked-plugin/children/grandchildren/autohooks.mjs

    export default async function (app, opts) {
      app.addHook('onRequest', async (req, reply) => {
        req.hookTwo = yes
      })
    }
    ```

    ```bash
    # app.js { autoHooks: true }

    $ curl http://localhost:3000/standard-plugin/
    {} # no hooks in this folder, so behaviour is unchanged

    $ curl http://localhost:3000/hooked-plugin/
    { hookOne: 'yes' }

    $ curl http://localhost:3000/hooked-plugin/children/old
    {}

    $ curl http://localhost:3000/hooked-plugin/children/new
    {}

    $ curl http://localhost:3000/hooked-plugin/children/grandchildren/ 
    { hookTwo: 'yes' }
    ```

    ```bash
    # app.js { autoHooks: true, cascadeHooks: true }

    $ curl http://localhost:3000/hooked-plugin/
    { hookOne: 'yes' }

    $ curl http://localhost:3000/hooked-plugin/children/old
    { hookOne: 'yes' }

    $ curl http://localhost:3000/hooked-plugin/children/new
    { hookOne: 'yes' }

    $ curl http://localhost:3000/hooked-plugin/children/grandchildren/ 
    { hookOne: 'yes', hookTwo: 'yes' } # hooks are accumulated and applied in ascending order
    ```

    ```bash
    # app.js { autoHooks: true, cascadeHooks: true, overwriteHooks: true }

    $ curl http://localhost:3000/hooked-plugin/
    { hookOne: 'yes' }

    $ curl http://localhost:3000/hooked-plugin/children/old
    { hookOne: 'yes' }

    $ curl http://localhost:3000/hooked-plugin/children/new
    { hookOne: 'yes' }

    $ curl http://localhost:3000/hooked-plugin/children/grandchildren/ 
    { hookTwo: 'yes' } # new autohooks.js takes over
    ```

## License

MIT
