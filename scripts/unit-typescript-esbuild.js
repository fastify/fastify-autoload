'use strict'

const { exec } = require('node:child_process')

const args = [
  'node',
  '-r esbuild-register',
  'test/typescript/basic.ts'
]
const child = exec(args.join(' '), {
  shell: true
})

child.stdout.pipe(process.stdout)
child.stderr.pipe(process.stderr)
child.once('close', process.exit)
