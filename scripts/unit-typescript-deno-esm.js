'use strict'

const { exec } = require('node:child_process')
const { argv } = require('node:process')

const args = [
  argv[0],
  'test',
  '-A',
  './test/typescript-esm/forceESM.ts'
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
