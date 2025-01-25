'use strict'

const { exec } = require('node:child_process')
const runtime = require('../lib/runtime')

const args = [
  'npx',
  runtime.nodeVersion >= 18 ? '--node-options=--import=tsx' : '',
  'tsnd',
  'test/typescript/basic.ts'
]

const child = exec(args.join(' '), {
  shell: true
})

child.stdout.pipe(process.stdout)
child.stderr.pipe(process.stderr)
child.once('close', process.exit)
