import { exec } from 'child_process'

describe('integration test', function () {
  test.concurrent.each(['ts-node', 'ts-node-dev'])(
    'integration with %s',
    async function (instance) {
      await new Promise(function (resolve, reject) {
        const child = exec(`${instance} "${process.cwd()}/test/typescript-jest/integration/instance.ts"`)
        let stderr = ''
        child.stderr?.on('data', function (b) {
          stderr = stderr + b.toString()
        })
        let stdout = ''
        child.stdout?.on('data', function (b) {
          stdout = stdout + b.toString()
        })
        child.once('close', function () {
          expect(stderr.includes('failed')).toStrictEqual(false)
          expect(stdout.includes('success')).toStrictEqual(true)
          resolve('')
        })
      })
    },
    30000
  )
})
