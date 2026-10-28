'use strict'

/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './test/typescript-jest',
  testMatch: ['**/*.test.ts'],
  // cookie@2 (pulled in by light-my-request) is ESM-only and must be
  // transpiled to CJS for this suite, which runs in CommonJS via ts-jest.
  transformIgnorePatterns: ['/node_modules/(?!cookie/)'],
  transform: {
    '^.+\\.(ts|tsx|js)$': [
      'ts-jest',
      {
        tsconfig: {
          allowJs: true,
          esModuleInterop: true,
          types: ['jest', 'node']
        }
      }
    ]
  }
}
