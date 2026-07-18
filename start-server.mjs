import app from './dist/server/server/server.js'
import { toNodeHandler } from 'srvx/node'
import { createServer } from 'node:http'
import { readdirSync, readFileSync, existsSync, statSync, createReadStream } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { join, dirname, extname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const PORT = process.env.PORT || 3001
const __dirname = dirname(fileURLToPath(import.meta.url))
const AVATAR_DIR = process.env.AVATARS_PATH || join(__dirname, 'data/avatars')

const MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

const handler = toNodeHandler(app.fetch, { trustProxy: true })

function resolveExportName(source, originalName) {
  const re = new RegExp(`${originalName}\\s+as\\s+(\\w+)`)
  return source.match(re)?.[1] || null
}

async function warmGitHubCache() {
  try {
    const assetsDir = join(__dirname, 'dist/server/server/assets')
    const cacheFile = readdirSync(assetsDir).find((f) => f.startsWith('cache-') && f.endsWith('.js'))
    if (!cacheFile) {
      console.warn('[cache] warm skipped: cache bundle not found')
      return
    }
    const source = readFileSync(join(assetsDir, cacheFile), 'utf8')
    const startName = resolveExportName(source, 'startRefreshLoop')
    const refreshName = resolveExportName(source, 'refreshCache')
    const getName = resolveExportName(source, 'getCacheWithRefresh')
    const mod = await import(pathToFileURL(join(assetsDir, cacheFile)).href)

    if (startName && typeof mod[startName] === 'function') {
      mod[startName]()
      return
    }
    if (refreshName && typeof mod[refreshName] === 'function') {
      await mod[refreshName]()
      return
    }
    if (getName && typeof mod[getName] === 'function') {
      await mod[getName]()
    }
  } catch (err) {
    console.error('[cache] warm failed:', err)
  }
}

function serveAvatar(req, res) {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  if (!url.pathname.startsWith('/avatars/')) return false

  const name = basename(url.pathname)
  if (!name || name !== basename(name) || name.includes('..')) {
    res.writeHead(400)
    res.end('bad request')
    return true
  }

  const filePath = join(AVATAR_DIR, name)
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    res.writeHead(404)
    res.end('not found')
    return true
  }

  const ext = extname(name).toLowerCase()
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': 'public, max-age=86400',
  })
  createReadStream(filePath).pipe(res)
  return true
}

const server = createServer((req, res) => {
  if (serveAvatar(req, res)) return
  return handler(req, res)
})

server.listen(PORT, () => {
  console.log('Server listening on http://localhost:' + PORT)
  warmGitHubCache()
})
