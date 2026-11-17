'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const projectRoot = path.join(__dirname, '../../..')
const runtimePath = require.resolve('../../../lib/runtime')
const fakeRoot = path.join(__dirname, 'fake-project')

// The runtime checks are cached for the lifetime of the process, so each case
// runs in its own process. `setup` runs before the runtime module is loaded.
function runtimeAfter (setup) {
  const script = `
    ${setup}
    const runtime = require(${JSON.stringify(runtimePath)})
    process.stdout.write(JSON.stringify({
      preloadModules: process._preload_modules ?? [],
      swc: runtime.swc,
      tsm: runtime.tsm,
      esbuild: runtime.esbuild,
      tsx: runtime.tsx
    }))
  `
  // Keep these processes out of the coverage report, the module is loaded
  // with different require.cache contents than in a real run.
  const env = { ...process.env, NODE_V8_COVERAGE: '' }
  return JSON.parse(execFileSync(process.execPath, ['-e', script], {
    cwd: projectRoot,
    encoding: 'utf8',
    env
  }))
}

// Simulate modules loaded through a plain require(), as fastify-cli does with
// its `-r` option, by adding entries to require.cache.
function runtimeWithCached (filenames) {
  return runtimeAfter(`
    for (const filename of ${JSON.stringify(filenames)}) {
      require.cache[filename] = { id: filename, filename, loaded: true, exports: {} }
    }
  `)
}

describe('Issue 404: detect TypeScript loaders preloaded with require()', function () {
  it('detects @swc-node/register loaded with require()', function () {
    const result = runtimeAfter("require('@swc-node/register')")
    assert.ok(!result.preloadModules.includes('@swc-node/register'))
    assert.strictEqual(result.swc, true)
  })

  it('detects @swc/register in require.cache', function () {
    const result = runtimeWithCached([
      path.join(fakeRoot, 'node_modules', '@swc', 'register', 'index.js')
    ])
    assert.strictEqual(result.swc, true)
  })

  it('detects tsm, esbuild-register and tsx in require.cache', function () {
    const result = runtimeWithCached([
      path.join(fakeRoot, 'node_modules', 'tsm', 'require.js'),
      path.join(fakeRoot, 'node_modules', 'esbuild-register', 'dist', 'node.js'),
      path.join(fakeRoot, 'node_modules', 'tsx', 'dist', 'cjs', 'index.cjs')
    ])
    assert.strictEqual(result.tsm, true)
    assert.strictEqual(result.esbuild, true)
    assert.strictEqual(result.tsx, true)
  })

  it('uses the innermost node_modules folder (pnpm layout)', function () {
    const result = runtimeWithCached([
      path.join(fakeRoot, 'node_modules', '.pnpm', '@swc-node+register@1.0.0', 'node_modules', '@swc-node', 'register', 'index.js')
    ])
    assert.strictEqual(result.swc, true)
  })

  it('handles Windows style paths', function () {
    const result = runtimeWithCached([
      'C:\\project\\node_modules\\@swc-node\\register\\index.js'
    ])
    assert.strictEqual(result.swc, true)
  })

  it('does not match unrelated or similarly named packages', function () {
    const result = runtimeWithCached([
      path.join(fakeRoot, 'node_modules', '@swc', 'core', 'index.js'),
      path.join(fakeRoot, 'node_modules', 'tsm-utils', 'index.js'),
      path.join(fakeRoot, 'node_modules', 'esbuild', 'lib', 'main.js'),
      path.join(fakeRoot, 'src', 'tsm', 'index.js'),
      path.join(fakeRoot, 'node_modules')
    ])
    assert.strictEqual(result.swc, false)
    assert.strictEqual(result.tsm, false)
    assert.strictEqual(result.esbuild, false)
  })
})
