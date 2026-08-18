import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const root = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(root, 'public')

const publicFile = (urlPath) => resolve(publicDir, urlPath.replace(/^\//, ''))

const rewriteLibrary = (req, _res, next) => {
  const [path, query = ''] = (req.url ?? '').split('?')
  const qs = query ? `?${query}` : ''
  if (!path.startsWith('/library')) {
    next()
    return
  }

  const exact = publicFile(path)
  if (existsSync(exact) && statSync(exact).isFile()) {
    next()
    return
  }

  const indexPath = `${path.replace(/\/$/, '')}/index.html`
  if (existsSync(publicFile(indexPath))) {
    req.url = indexPath + qs
  }

  next()
}

const libraryStaticSites = () => ({
  name: 'library-static-sites',
  configureServer(server) {
    server.middlewares.use(rewriteLibrary)
  },
  configurePreviewServer(server) {
    server.middlewares.use(rewriteLibrary)
  },
})

const copyDir = (from, to) => {
  mkdirSync(to, { recursive: true })
  for (const name of readdirSync(from)) {
    const src = join(from, name)
    const dest = join(to, name)
    if (statSync(src).isDirectory()) copyDir(src, dest)
    else cpSync(src, dest)
  }
}

const copyPublic = () => ({
  name: 'copy-public',
  apply: 'build',
  closeBundle() {
    copyDir(publicDir, resolve(root, 'dist'))
  },
})

export default defineConfig({
  appType: 'mpa',
  build: {
    copyPublicDir: false,
  },
  plugins: [copyPublic(), libraryStaticSites()],
})
