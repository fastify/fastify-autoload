'use strict'

const { readdir } = require('node:fs/promises')
const { relative, join } = require('node:path')
const runtime = require('./runtime')

async function findPlugins (dir, options) {
  const { opts, prefix } = options

  const pluginTree = {
    [dir]: { hooks: [], plugins: [] }
  }

  await buildTree(pluginTree, dir, { prefix, opts, depth: 0, hooks: [] })

  return pluginTree
}

async function buildTree (pluginTree, dir, { prefix, opts, depth, hooks }) {
  // check to see if hooks or plugins have been added to this prefix, initialize if not
  if (!pluginTree[dir]) {
    pluginTree[dir] = { hooks: [], plugins: [] }
  }

  const dirEntries = await readdir(dir, { withFileTypes: true })

  const currentDirHooks = findCurrentDirHooks(pluginTree, { dir, dirEntries, hooks, opts })

  const { indexDirEntry, hasNoDirectory } = processIndexDirEntryIfExists(pluginTree, { dirEntries, opts, dir, prefix })
  if (hasNoDirectory) {
    return
  }

  // Contains package.json but no index.js file?
  const packageDirEntry = dirEntries.find((dirEntry) => dirEntry.name === 'package.json')
  if (packageDirEntry && !indexDirEntry) {
    throw new Error(`@fastify/autoload cannot import plugin at '${dir}'. To fix this error rename the main entry file to 'index.js' (or .cjs, .mjs, .ts).`)
  }

  // Otherwise treat each script file as a plugin
  await processDirContents(pluginTree, { dirEntries, opts, indexDirEntry, prefix, dir, depth, currentDirHooks })
}

function findCurrentDirHooks (pluginTree, { dir, dirEntries, hooks, opts }) {
  if (!opts.autoHooks) return []

  let currentDirHooks = []
  // Hooks were passed in, create new array specific to this plugin item
  for (const hook of hooks) {
    currentDirHooks.push(hook)
  }

  // Contains autohooks file?
  const autoHooks = dirEntries.find((dirEntry) => opts.autoHooksPattern.test(dirEntry.name))
  if (autoHooks) {
    const file = join(dir, autoHooks.name)
    const { type } = getScriptType(file, opts.packageType)

    // Overwrite current hooks?
    if (opts.overwriteHooks && currentDirHooks.length > 0) {
      currentDirHooks = []
    }

    // Add hook to current chain
    currentDirHooks.push({ file, type })
  }

  pluginTree[dir].hooks = currentDirHooks

  return currentDirHooks
}

function processIndexDirEntryIfExists (pluginTree, { opts, dirEntries, dir, prefix }) {
  // Contains index file?
  const indexDirEntry = dirEntries.find((dirEntry) => opts.indexPattern.test(dirEntry.name))
  if (!indexDirEntry) return { indexDirEntry }

  const file = join(dir, indexDirEntry.name)
  const { language, type } = getScriptType(file, opts.packageType)
  handleTypeScriptSupport(file, language, true)
  accumulatePlugin({ dir, file, type, opts, pluginTree, prefix })

  const hasNoDirectory = dirEntries.every((dirEntry) => !dirEntry.isDirectory())

  return { indexDirEntry, hasNoDirectory }
}

async function processDirContents (pluginTree, { dirEntries, opts, indexDirEntry, prefix, dir, depth, currentDirHooks }) {
  for (const dirEntry of dirEntries) {
    if (opts.ignorePattern && RegExp(opts.ignorePattern).test(dirEntry.name)) {
      continue
    }

    const atMaxDepth = Number.isFinite(opts.maxDepth) && opts.maxDepth <= depth
    const file = join(dir, dirEntry.name)
    if (dirEntry.isDirectory() && !atMaxDepth) {
      await processDirectory(pluginTree, { prefix, opts, dirEntry, dir, file, depth, currentDirHooks })
    } else if (indexDirEntry) {
      // An index.js file is present in the directory so we ignore the others modules (but not the subdirectories)
    } else if (dirEntry.isFile() && opts.scriptPattern.test(dirEntry.name)) {
      processFile(pluginTree, { dir, file, opts, dirEntry, pluginTree, prefix })
    }
  }
}

async function processDirectory (pluginTree, { prefix, opts, dirEntry, dir, file, depth, currentDirHooks }) {
  let prefixBreadCrumb = (prefix ? `${prefix}/` : '/')
  if (opts.dirNameRoutePrefix === true) {
    prefixBreadCrumb += dirEntry.name
  } else if (typeof opts.dirNameRoutePrefix === 'function') {
    const prefixReplacer = opts.dirNameRoutePrefix(dir, dirEntry.name)
    if (prefixReplacer) {
      prefixBreadCrumb += prefixReplacer
    }
  }

  // Pass hooks forward to next level
  const hooks = opts.autoHooks && opts.cascadeHooks ? currentDirHooks : []
  await buildTree(pluginTree, file, { opts, prefix: prefixBreadCrumb, depth: depth + 1, hooks })
}

function processFile (pluginTree, { dir, file, opts, dirEntry, prefix }) {
  const { language, type } = getScriptType(file, opts.packageType)
  handleTypeScriptSupport(file, language)

  // Don't place hook in plugin queue
  if (!opts.autoHooksPattern.test(dirEntry.name)) {
    accumulatePlugin({ dir, file, type, opts, pluginTree, prefix })
  }
}

function accumulatePlugin ({ dir, file, type, opts, pluginTree, prefix }) {
  // Replace backward slash to forward slash for consistent behavior between windows and posix.
  const filePath = '/' + relative(opts.dir, file).replace(/\\/gu, '/')
  if (opts.matchFilter && !filterPath(filePath, opts.matchFilter)) {
    return
  }

  if (opts.ignoreFilter && filterPath(filePath, opts.ignoreFilter)) {
    return
  }

  pluginTree[dir].plugins.push({ file, type, prefix })
}

function handleTypeScriptSupport (file, language, isHook = false) {
  if (
    language === 'typescript' &&
    /* c8 ignore start - This cannot be reached from Node 23 native type-stripping */
    !runtime.supportTypeScript
  ) {
    throw new Error(
      `@fastify/autoload cannot import ${isHook ? 'hooks ' : ''}plugin at '${file}'. To fix this error compile TypeScript to JavaScript or use 'ts-node' to run your app.`
    )
  }
  /* c8 ignore end */
}

function filterPath (path, filter) {
  if (typeof filter === 'string') {
    return path.includes(filter)
  }

  if (filter instanceof RegExp) {
    return filter.test(path)
  }

  return filter(path)
}

const typescriptPattern = /\.(?:ts|mts|cts)$/iu
function getScriptType (fname, packageType) {
  return {
    language: typescriptPattern.test(fname) ? 'typescript' : 'javascript',
    type: determineModuleType(fname, packageType)
  }
}

const modulePattern = /\.(?:mjs|mts)$/iu
const commonjsPattern = /\.(?:cjs|cts)$/iu
function determineModuleType (fname, defaultType) {
  if (modulePattern.test(fname)) {
    return 'module'
  }

  if (commonjsPattern.test(fname)) {
    return 'commonjs'
  }

  return defaultType || 'commonjs'
}

module.exports = findPlugins
