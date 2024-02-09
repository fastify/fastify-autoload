/// <reference types="vite/client" />

import { defineConfig } from 'vite'
import { VitePluginNode } from 'vite-plugin-node'
import commonjs from '@rollup/plugin-commonjs'

export default defineConfig({
  plugins: [
    ...VitePluginNode({
      adapter: 'fastify',
      appPath: 'test/typescript/basic.ts'
    })
  ],
  build: {
    rollupOptions: {
      plugins: [commonjs()]
    }
  }
})
