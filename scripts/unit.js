'use strict'

const { globSync } = require('fast-glob')
const { exec } = require('node:child_process')

// Expand patterns
const testFiles = [
  ...globSync('test/issues/*/test.js'),
  ...globSync('test/commonjs/*.js'),
  ...globSync('test/module/*.js'),
]

const args = ['node', '--test', ...testFiles]

const child = exec(args.join(' '), {
  shell: true,
})

child.stdout.pipe(process.stdout)
child.stderr.pipe(process.stderr)
child.once('close', process.exit)
