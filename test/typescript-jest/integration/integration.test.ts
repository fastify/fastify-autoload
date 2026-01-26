import { exec } from 'node:child_process'
import { join } from 'node:path'

describe('integration test', function () {
  const isWindows = process.platform === 'win32'

  test.concurrent.each(['ts-node', 'ts-node-dev'])(
    'integration with %s',
    async function (instance) {
      await new Promise(function (resolve) {
        const compilerOpts = JSON.stringify({
          module: 'commonjs',
          moduleResolution: 'node',
          esModuleInterop: true
        })

        const optionsArg = isWindows
          ? `"${compilerOpts.replace(/"/g, '\\"')}"`
          : `'${compilerOpts}'`

        const filePath = join(
          process.cwd(),
          'test',
          'typescript-jest',
          'integration',
          'instance.ts'
        )

        const child = exec(
          `npx ${instance} --compiler-options ${optionsArg} "${filePath}"`
        )

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
    isWindows ? 60000 : 30000
  )
})
