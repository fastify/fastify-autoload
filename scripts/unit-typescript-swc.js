'use strict'

const { exec } = require('child_process')
const semver = require('semver')

if (semver.satisfies(process.version, '>= 14')) {
  const args = [
    'tap',
    '--node-arg=--require=@swc/register',
    '--no-coverage',
    'test/typescript/*.ts'
  ]

  const child = exec(args.join(' '), {
    shell: true
  })

  child.stdout.pipe(process.stdout)
  child.stderr.pipe(process.stderr)
  child.once('close', process.exit)
}
