'use strict'

const { exec } = require('node:child_process')

const args = [
  'TSIMP_PROJECT=tsconfig.tsimp.json',
  'node',
  '--import=tsimp/import',
  'test/typescript/basic.ts'
]

const child = exec(args.join(' '), {
  shell: true
})

child.stdout.pipe(process.stdout)
child.stderr.pipe(process.stderr)
child.once('close', process.exit)
