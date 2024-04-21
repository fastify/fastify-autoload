'use strict'

const { exec } = require('node:child_process')

const version = Number(process.version.split('.')[0].slice(1))

const args = [
  'npx',
  version >= 18 ? '--node-options=--import=tsx' : '',
  'tsnd',
  'test/typescript/basic.ts'
]

const child = exec(args.join(' '), {
  shell: true
})

child.stdout.pipe(process.stdout)
child.stderr.pipe(process.stderr)
child.once('close', process.exit)
