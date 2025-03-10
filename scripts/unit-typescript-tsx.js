'use strict'

const { exec } = require('node:child_process')

const nodeVersion = Number(process.version.split('.')[0].slice(1))

const args = [
  'npx',
  nodeVersion >= 18 ? '--node-options=--import=tsx' : '',
  'tsnd',
  'test/typescript/basic.ts'
]

const child = exec(args.join(' '), {
  shell: true
})

child.stdout.pipe(process.stdout)
child.stderr.pipe(process.stderr)
child.once('close', process.exit)
