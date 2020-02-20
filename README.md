# fastify-autoload

[![Build Status](https://travis-ci.org/fastify/fastify-autoload.svg?branch=master)](https://travis-ci.org/fastify/fastify-autoload)&nbsp;
[![Greenkeeper badge](https://badges.greenkeeper.io/fastify/fastify-autoload.svg)](https://greenkeeper.io/)

Require all plugins in a directory.

## Install

```
npm i fastify fastify-autoload
```

## Example

```js
'use strict'

const Fastify = require('fastify')
const AutoLoad = require('fastify-autoload')

const fastify = Fastify()

fastify.register(AutoLoad, {
  dir: path.join(__dirname, 'foo')
})

fastify.listen(3000)
```

## Custom configuration

Each autloaded plugin can define a configuration object using the `autoConfig` property, which will passed in as the `opts` parameter:

```js
module.exports = function (fastify, opts, next) {
  console.log(opts.foo) // 'bar'
  next()
}

module.exports.autoConfig = { foo: 'bar' }
```

This is useful as a shorthand for configuring required plugins:

```js
const helmet = require('fastify-helmet')
helmet.autoConfig = { referrerPolicy: true }
module.exports = helmet
```


Each time an `autoConfig` property is consumed by `fastify-autoload` it will be reset back to `undefined`, this means the auto configuration only applies where it's declared, even if the same plugin is auto loaded in two separate folders.


Plugins in the loaded folder could add an `autoPrefix` property, so that
a prefix is applied automatically when loaded with `fastify-autoload`:

```js
module.exports = function (fastify, opts, next) {
  // when loaded with autoload, this will be exposed as /something
  fastify.get('/', (request, reply) => {
    reply.send({ hello: 'world' })
  })

  next()
}

// optional
module.exports.autoPrefix = '/something'
```

If you need to disable the auto loading for a specific plugin, add `autoload = false` property.
```js
module.exports = function (fastify, opts, next) {
  // your plugin
}

// optional
module.exports.autoload = false
```

If you want to pass some custom options to all registered plugins via `fastify-autoload`, use the `options` key:

```js
fastify.register(AutoLoad, {
  dir: path.join(__dirname, 'foo'),
  options: { foo: 'bar' }
})
```
> *Note: `options` will be passed to all loaded plugins.*
> *Note: global default options will override the `plugin.autoConfig` property*

You can set the prefix option in the options passed to all plugins to set them all default prefix.
When plugins get passed `prefix` as a default option, the `autoPrefix` property gets appended to them.
This means you can load all plugins in a folder with a default prefix.

```js
// index.js
fastify.register(AutoLoad, {
  dir: path.join(__dirname, 'foo'),
  options: { prefix: '/defaultPrefix' }
})

// /foo/something.js
module.exports = function (fastify, opts, next) {
  // your plugin
}

// optional
module.exports.autoPrefix = '/something'

// routes can now be added to /defaultPrefix/something
```

If you have a plugin in the folder you don't want the default prefix applied to, you can add the `prefixOverride` key:

```js
// index.js
fastify.register(AutoLoad, {
  dir: path.join(__dirname, 'foo'),
  options: { prefix: '/defaultPrefix' }
})

// /foo/something.js
module.exports = function (fastify, opts, next) {
  // your plugin
}

// optional
module.exports.prefixOverride = '/overriddenPrefix'

// routes can now be added to /overriddenPrefix
```

If you have a plugin in the folder you don't want the any prefix applied to, you can set `prefixOverride = ''`:

```js
// index.js
fastify.register(AutoLoad, {
  dir: path.join(__dirname, 'foo'),
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

If you have some files in the folder that you'd like autoload to skip you can set `ignorePattern` option to a regex. If
that matches a file it will not load it.

```js
// index.js
fastify.register(AutoLoad, {
  dir: path.join(__dirname, 'foo'),
  options: { prefix: '/defaultPrefix' },
  ignorePattern: /.*(test|spec).js/
})
```

If you are using TypeScript and something like [ts-node](https://github.com/TypeStrong/ts-node) to load the `.ts` files directly you can set `includeTypeScript` option to `true`. This will load plugins from `.ts` files as well as `.js` files.

```ts
// index.ts
fastify.register(AutoLoad, {
  dir: path.join(__dirname, 'foo'),
  includeTypeScript: true
})
```
> *Note: This is not required when running compiled TypeScript. Type definition files (`.d.ts`) will always be ignored (see [#65](https://github.com/fastify/fastify-autoload/issues/65)).*


fastify-autoload loads folders with route definitions automatically, without explicitly registering them. The folder name is used as default prefix for all files in that folder, unless otherwise specified in an `index.js`. See "module.exports.autoPrefix" on how to overwrite this behaviour.

```js
// index.js
fastify.register(AutoLoad, {
  dir: path.join(__dirname, 'services'),
  options: {}
})

// /services/items/get.js
module.exports = function (f, opts, next) {
  f.get('/:id', (request, reply) => {
    reply.send({ answer: 42 })
  })

  next()
}

// /services/items/list.js
module.exports = function (f, opts, next) {
  f.get('/', (request, reply) => {
    reply.send([0, 1, 2])
  })

  next()
}

/**
 * Routes generated:
 * GET /items
 * GET /items/:id
 */
```

For routes (not plugins), you can skip the "boilerplate" of exporting the fastify function and use a route schema ([full route declaration](https://www.fastify.io/docs/master/Routes/#full-declaration)) instead. The method, url and handler are required, everything else optional. If you need additional options such as a `prefix` or `ignorePattern`, this does _not_ work.

```js
// /services/items/list.js
module.exports = {
  method: 'GET',
  url: '/',
  handler: (request, reply) => {
    reply.send({ answer: 42 })
  }
}

/**
 * Routes generated:
 * GET /items
 */
```


## License

MIT
