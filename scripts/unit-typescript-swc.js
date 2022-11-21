'use strict'

const { exec } = require('child_process')

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
