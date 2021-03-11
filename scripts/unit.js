'use strict'

const { exec } = require('child_process')
const semver = require('semver')

const child = exec(semver.satisfies('>=14 || >= 12.17.0 < 13.0.0')
  ? 'npm run unit:with-modules'
  : 'npm run unit:without-modules')

child.stdout.pipe(process.stdout)
child.stderr.pipe(process.stderr)
child.once('close', process.exit)
