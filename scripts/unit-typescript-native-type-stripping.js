'use strict'

const { exec } = require('node:child_process')
const runtime = require('../lib/runtime')

if (runtime.supportNativeTypeScript) {
  common()
}

function common () {
  const args = ['node', 'test/typescript-common/index.ts']
  const child = exec(args.join(' '), {
    shell: true,
  })
  child.stdout.pipe(process.stdout)
  child.stderr.pipe(process.stderr)
  child.once('close', esm)
}

function esm () {
  const args = ['node', 'test/typescript-esm/forceESM.ts']

  const child = exec(args.join(' '), {
    shell: true,
  })

  child.stdout.pipe(process.stdout)
  child.stderr.pipe(process.stderr)
  child.once('close', process.exit)
}
