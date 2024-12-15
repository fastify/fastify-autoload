import url from 'node:url'
import process from 'node:process'

if (url.fileURLToPath(import.meta.url) === process.argv[1]) {
  // side effects
}

export const autoload = false
