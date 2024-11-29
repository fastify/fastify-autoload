'use strict'

module.exports = require('neostandard')({
  ignores: [
    ...require('neostandard').resolveIgnoresFromGitignore(),
    'test/commonjs/syntax-error/lib/a.js',
    'test/issues/369/invalid-autohooks',
    'test/issues/369/non-SyntaxError'
  ],
  ts: true
})
