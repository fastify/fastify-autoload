'use strict'

// runtime cache
const cache = {}

let processArgv
function checkProcessArgv (moduleName) {
  /* c8 ignore start */
  // nullish needed for non Node.js runtime
  processArgv ??= (process.execArgv ?? []).concat(process.argv ?? [])
  /* c8 ignore stop */
  return processArgv.some((arg) => arg.indexOf(moduleName) >= 0)
}

let preloadModules
function checkPreloadModules (moduleName) {
  /* c8 ignore start */
  // nullish needed for non Node.js runtime
  preloadModules ??= (process._preload_modules ?? [])
  /* c8 ignore stop */
  return preloadModules.includes(moduleName)
}

let preloadModulesString
function checkPreloadModulesString (moduleName) {
  preloadModulesString ??= preloadModules.toString()
  return preloadModulesString.includes(moduleName)
}

function checkEnvVariable (name, value) {
  return value
    ? process.env[name] === value
    : process.env[name] !== undefined
}

const runtime = {}
// use Object.defineProperties to provide lazy load
Object.defineProperties(runtime, {
  tsNode: {
    get () {
      cache.tsNode ??= (
        // --require tsnode/register
        (Symbol.for('ts-node.register.instance') in process) ||
        // --loader ts-node/esm
        checkProcessArgv('ts-node/esm') ||
        // ts-node-dev
        !!process.env.TS_NODE_DEV
      )
      return cache.tsNode
    }
  },
  babelNode: {
    get () {
      cache.babelNode ??= checkProcessArgv('babel-node')
      return cache.babelNode
    }
  },
  vitest: {
    get () {
      cache.vitest ??= (
        checkEnvVariable('VITEST', 'true') ||
        checkEnvVariable('VITEST_WORKER_ID')
      )
      return cache.vitest
    }
  },
  jest: {
    get () {
      cache.jest ??= checkEnvVariable('JEST_WORKER_ID')
      return cache.jest
    }
  },
  swc: {
    get () {
      cache.swc ??= (
        checkPreloadModules('@swc/register') ||
        checkPreloadModules('@swc-node/register') ||
        checkProcessArgv('.bin/swc-node')
      )
      return cache.swc
    }
  },
  tsm: {
    get () {
      cache.tsm ??= checkPreloadModules('tsm')
      return cache.tsm
    }
  },
  esbuild: {
    get () {
      cache.esbuild ??= checkPreloadModules('esbuild-register')
      return cache.esbuild
    }
  },
  tsx: {
    get () {
      cache.tsx ??= checkPreloadModulesString('tsx')
      return cache.tsx
    }
  },
  tsimp: {
    get () {
      cache.tsimp ??= checkProcessArgv('tsimp/import')
      return cache.tsimp
    }
  },
  supportTypeScript: {
    get () {
      cache.supportTypeScript ??= (
        checkEnvVariable('FASTIFY_AUTOLOAD_TYPESCRIPT') ||
        runtime.tsNode ||
        runtime.vitest ||
        runtime.babelNode ||
        runtime.jest ||
        runtime.swc ||
        runtime.tsm ||
        runtime.tsx ||
        runtime.esbuild ||
        runtime.tsimp
      )
      return cache.supportTypeScript
    }
  },
  forceESM: {
    get () {
      cache.forceESM ??= (
        checkProcessArgv('ts-node/esm') ||
        runtime.vitest ||
        false
      )
      return cache.forceESM
    }
  }
})

module.exports = runtime
module.exports.runtime = runtime
