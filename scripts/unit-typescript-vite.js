'use strict'

const { exec } = require('node:child_process')

const args1 = [
  'npx',
  'vite',
  'build',
  '--config test/typescript/vite.config.ts'
]

const child1 = exec(args1.join(' '), {
  shell: true
})

child1.stdout.pipe(process.stdout)
child1.stderr.pipe(process.stderr)
child1.once('close', process.exit)

const args2 = [
  'npx',
  'vite',
  'build',
  '--config test/typescript-esm/vite.config.ts'
]

const child2 = exec(args2.join(' '), {
  shell: true
})

child2.stdout.pipe(process.stdout)
child2.stderr.pipe(process.stderr)
child2.once('close', process.exit)
