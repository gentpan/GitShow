import app from './dist/server/server/server.js'
import { toNodeHandler } from 'srvx/node'
import { createServer } from 'node:http'
import { readdirSync, readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const PORT = process.env.PORT || 3001
const __dirname = dirname(fileURLToPath(import.meta.url))

const handler = toNodeHandler(app.fetch, { trustProxy: true })
const server = createServer(handler)

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

server.listen(PORT, () => {
  console.log('Server listening on http://localhost:' + PORT)
  warmGitHubCache()
})
