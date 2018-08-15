# fastify-autoload

[![Build Status](https://travis-ci.org/pinojs/pino.svg?branch=master)](https://travis-ci.org/pinojs/pino)&nbsp;
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
Plugins in the loaded folder could add an `autoPrefix` property, so that
a prefix is applied automatically when loaded with `fastify-autoload`:

```js
module.exports = function (fastify, opts, next) {
  // when loaded with autoload, this will be exposed as /something
  fastify.get('/', (request, reply) => {
    reply.send({ hello: 'world' })
  })
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

If you want to pass some custom options to the registered plugins via `fastify-autoload`, use the `options` key:
```js
fastify.register(AutoLoad, {
  dir: path.join(__dirname, 'foo'),
  options: { foo: 'bar' }
})
```
*Note that options will be passed to all loaded plugins.*

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
  options: { prefix: '/defaultPrefix' }
  ignorePattern: /.*(test|spec).js/
})
```

## License

MIT
