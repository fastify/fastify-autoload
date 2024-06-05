'use strict'

const { exec } = require('node:child_process')

const args = [
  'tap',
  '--node-arg=--loader=ts-node/esm',
  '--node-arg=--experimental-specifier-resolution=node',
  '--disable-coverage',
  '--allow-empty-coverage',
  'test/typescript-esm/*.ts'
]

const child = exec(args.join(' '), {
  shell: true,
  env: {
    ...process.env,
    TS_NODE_COMPILER_OPTIONS: JSON.stringify({
      module: 'ESNext',
      target: 'ES2020',
      allowJs: false,
      moduleResolution: 'node',
      esModuleInterop: true
    })
  }
})

child.stdout.pipe(process.stdout)
child.stderr.pipe(process.stderr)
child.once('close', process.exit)
