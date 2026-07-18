import app from './dist/server/server/server.js'
import { toNodeHandler } from 'srvx/node'
import { createServer } from 'node:http'
import { readdirSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const PORT = process.env.PORT || 3001
const __dirname = dirname(fileURLToPath(import.meta.url))

const handler = toNodeHandler(app.fetch, { trustProxy: true })
const server = createServer(handler)

async function warmGitHubCache() {
  try {
    const assetsDir = join(__dirname, 'dist/server/server/assets')
    const apiFile = readdirSync(assetsDir).find((f) => f.startsWith('api-') && f.endsWith('.js'))
    if (!apiFile) return
    // Loading the server-fn module starts the 1h refresh loop via getCacheWithRefresh/startRefreshLoop exports.
    const mod = await import(pathToFileURL(join(assetsDir, apiFile)).href)
    if (typeof mod.startRefreshLoop === 'function') {
      mod.startRefreshLoop()
      return
    }
    // Fallback: hit a cache-backed server function after listen.
    await fetch(`http://127.0.0.1:${PORT}/`)
  } catch (err) {
    console.error('[cache] warm failed:', err)
  }
}

server.listen(PORT, () => {
  console.log('Server listening on http://localhost:' + PORT)
  warmGitHubCache()
})
