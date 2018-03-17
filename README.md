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

Plugins in the loaded folder could add an `autoPrefix` property, so that
a prefix is applied automatically when loaded with `fastify-autoload`:

```
module.exports = function (fastify, opts, next) {
  // when loaded with autoload, this will be exposed as /something
  fastify.get('/', (request, reply) => {
    reply.send({ hello: 'world' })
  })
}

// optional
module.exports.autoPrefix = '/something'
```

## License

MIT
