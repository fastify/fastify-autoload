'use strict'

const { exec } = require('child_process')
const semver = require('semver')

if (semver.satisfies(process.version, '>= 14')) {
  const args = [
    'npx',
    'tsx',
    'test/typescript/basic.ts'
  ]

  const child = exec(args.join(' '), {
    shell: true
  })

  child.stdout.pipe(process.stdout)
  child.stderr.pipe(process.stderr)
  child.once('close', process.exit)
}
