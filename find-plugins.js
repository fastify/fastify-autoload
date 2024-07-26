const { readdir } = require('node:fs/promises')
const { relative, join } = require('path')
const runtime = require('./runtime')

async function findPlugins (dir, options) {
  const { opts, hookedAccumulator = {}, prefix, depth = 0, hooks = [] } = options
  const list = await readdir(dir, { withFileTypes: true })

  // check to see if hooks or plugins have been added to this prefix, initialize if not
  if (!hookedAccumulator[prefix || '/']) {
    hookedAccumulator[prefix || '/'] = { hooks: [], plugins: [] }
  }

  const currentHooks = findCurrentHooks({ dir, list, hooks, opts, hookedAccumulator, prefix })

  const indexDirent = processIndexDirentIfExists({ list, opts, dir, hookedAccumulator, prefix })

  // Contains package.json but no index.js file?
  const packageDirent = list.find((dirent) => dirent.name === 'package.json')
  if (packageDirent && !indexDirent) {
    throw new Error(`@fastify/autoload cannot import plugin at '${dir}'. To fix this error rename the main entry file to 'index.js' (or .cjs, .mjs, .ts).`)
  }

  // Otherwise treat each script file as a plugin
  await processList({ list, opts, indexDirent, prefix, dir, depth, currentHooks, hookedAccumulator })

  return hookedAccumulator
}

function findCurrentHooks ({ dir, list, hooks, opts, hookedAccumulator, prefix }) {
  let currentHooks = []

  if (opts.autoHooks) {
    // Hooks were passed in, create new array specific to this plugin item
    if (hooks && hooks.length > 0) {
      for (const hook of hooks) {
        currentHooks.push(hook)
      }
    }

    // Contains autohooks file?
    const autoHooks = list.find((dirent) => opts.autoHooksPattern.test(dirent.name))
    if (autoHooks) {
      const autoHooksFile = join(dir, autoHooks.name)
      const { type: autoHooksType } = getScriptType(autoHooksFile, opts.packageType)

      // Overwrite current hooks?
      if (opts.overwriteHooks && currentHooks.length > 0) {
        currentHooks = []
      }

      // Add hook to current chain
      currentHooks.push({ file: autoHooksFile, type: autoHooksType })
    }

    hookedAccumulator[prefix || '/'].hooks = currentHooks
  }

  return currentHooks
}

function processIndexDirentIfExists ({ opts, list, dir, hookedAccumulator, prefix }) {
  // Contains index file?
  const indexDirent = list.find((dirent) => opts.indexPattern.test(dirent.name))
  if (!indexDirent) return null

  const file = join(dir, indexDirent.name)
  const { language, type } = getScriptType(file, opts.packageType)
  handleTypeScriptSupport(file, language, true)

  accumulatePlugin({ file, type, opts, hookedAccumulator, prefix })
  const hasDirectory = list.find((dirent) => dirent.isDirectory())

  if (!hasDirectory) {
    return hookedAccumulator
  }

  return indexDirent
}

async function processList ({ list, opts, indexDirent, prefix, dir, depth, currentHooks, hookedAccumulator }) {
  const directoryPromises = []
  for (const dirent of list) {
    if (opts.ignorePattern && RegExp(opts.ignorePattern).exec(dirent.name)) {
      continue
    }

    const atMaxDepth = Number.isFinite(opts.maxDepth) && opts.maxDepth <= depth
    const file = join(dir, dirent.name)
    if (dirent.isDirectory() && !atMaxDepth) {
      processDir({ prefix, opts, dirent, dir, file, directoryPromises, hookedAccumulator, depth, currentHooks })
    } else if (indexDirent) {
      // An index.js file is present in the directory so we ignore the others modules (but not the subdirectories)
    } else if (dirent.isFile() && opts.scriptPattern.test(dirent.name)) {
      processFile({ file, opts, dirent, hookedAccumulator, prefix })
    }
  }

  await Promise.all(directoryPromises)
}

function processDir ({ prefix, opts, dirent, dir, file, directoryPromises, hookedAccumulator, depth, currentHooks }) {
  let prefixBreadCrumb = (prefix ? `${prefix}/` : '/')
  if (opts.dirNameRoutePrefix === true) {
    prefixBreadCrumb += dirent.name
  } else if (typeof opts.dirNameRoutePrefix === 'function') {
    const prefixReplacer = opts.dirNameRoutePrefix(dir, dirent.name)
    if (prefixReplacer) {
      prefixBreadCrumb += prefixReplacer
    }
  }

  // Pass hooks forward to next level
  if (opts.autoHooks && opts.cascadeHooks) {
    directoryPromises.push(findPlugins(file, { opts, hookedAccumulator, prefix: prefixBreadCrumb, depth: depth + 1, hooks: currentHooks }))
  } else {
    directoryPromises.push(findPlugins(file, { opts, hookedAccumulator, prefix: prefixBreadCrumb, depth: depth + 1 }))
  }
}

function processFile ({ file, opts, dirent, hookedAccumulator, prefix }) {
  const { language, type } = getScriptType(file, opts.packageType)
  handleTypeScriptSupport(file, language)

  // Don't place hook in plugin queue
  if (!opts.autoHooksPattern.test(dirent.name)) {
    accumulatePlugin({ file, type, opts, hookedAccumulator, prefix })
  }
}

function accumulatePlugin ({ file, type, opts, hookedAccumulator, prefix }) {
  // Replace backward slash to forward slash for consistent behavior between windows and posix.
  const filePath = '/' + relative(opts.dir, file).replace(/\\/gu, '/')

  if (opts.matchFilter && !filterPath(filePath, opts.matchFilter)) {
    return
  }

  if (opts.ignoreFilter && filterPath(filePath, opts.ignoreFilter)) {
    return
  }

  hookedAccumulator[prefix || '/'].plugins.push({ file, type, prefix })
}

function handleTypeScriptSupport (file, language, isHook = false) {
  if (language === 'typescript' && !runtime.supportTypeScript) {
    throw new Error(`@fastify/autoload cannot import ${isHook ? 'hooks ' : ''}plugin at '${file}'. To fix this error compile TypeScript to JavaScript or use 'ts-node' to run your app.`)
  }
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

const typescriptPattern = /\.(ts|mts|cts)$/iu
const modulePattern = /\.(mjs|mts)$/iu
const commonjsPattern = /\.(cjs|cts)$/iu
function getScriptType (fname, packageType) {
  return {
    language: typescriptPattern.test(fname) ? 'typescript' : 'javascript',
    type: determineModuleType(fname, packageType)
  }
}

function determineModuleType (fname, defaultType) {
  if (modulePattern.test(fname)) {
    return 'module'
  } else if (commonjsPattern.test(fname)) {
    return 'commonjs'
  }

  return defaultType || 'commonjs'
}

module.exports = findPlugins
