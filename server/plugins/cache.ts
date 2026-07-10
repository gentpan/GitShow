import { startRefreshLoop } from '../utils/cache'
import { loadConfig } from '../utils/config'

export default defineNitroPlugin(() => {
  try {
    const cfg = loadConfig()
    if (!cfg.username || !cfg.token || cfg.token === 'ghp_your_token_here') {
      console.error('[gitshow] please set valid username and token in config.json or GITHUB_TOKEN')
      return
    }
    startRefreshLoop()
  } catch (err) {
    console.error('[gitshow] failed to start cache loop:', err)
  }
})
