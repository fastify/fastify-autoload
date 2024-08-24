'use strict'

const { exec } = require('node:child_process')
const { argv } = require('node:process')

const child = exec(argv[2] + ' run unit:with-modules')

child.stdout.pipe(process.stdout)
child.stderr.pipe(process.stderr)
child.once('close', process.exit)
