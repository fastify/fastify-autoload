import url from 'url'
import process from 'process'

if (url.fileURLToPath(import.meta.url) === process.argv[1]) {
  // side effects
}

export const autoload = false
