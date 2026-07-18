import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { loadConfig, getUsername } from './config'
import {
  getUser,
  getRepos,
  getAllEvents,
  getContributions,
  getUserFollowing,
  enrichRepos,
  buildHeatmapFromEvents,
} from './github'
import type { CacheData, FollowingCache, StarHistoryPoint } from './types'

let cache: CacheData = {
  user: null,
  repos: [],
  events: [],
  following: {},
  followingNames: [],
  heatmap: [],
  totalStars: 0,
  totalCommits: 0,
  totalRepos: 0,
  lastUpdated: null,
}

let refreshPromise: Promise<void> | null = null
let lastRefresh = 0

export function getCache(): CacheData {
  return cache
}

function recordStarHistory(totalStars: number) {
  const today = new Date().toISOString().slice(0, 10)
  const path = process.env.STAR_HISTORY_PATH || 'star-history.json'
  let history: StarHistoryPoint[] = []
  if (existsSync(path)) {
    try {
      history = JSON.parse(readFileSync(path, 'utf-8')) as StarHistoryPoint[]
    } catch {
      history = []
    }
  }
  const idx = history.findIndex((h) => h.date === today)
  if (idx >= 0) history[idx].stars = totalStars
  else history.push({ date: today, stars: totalStars })
  if (history.length > 90) history = history.slice(-90)
  writeFileSync(path, JSON.stringify(history, null, 2), 'utf-8')
}

export function getStarHistory(): StarHistoryPoint[] {
  const path = process.env.STAR_HISTORY_PATH || 'star-history.json'
  if (!existsSync(path)) return []
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as StarHistoryPoint[]
  } catch {
    return []
  }
}

export async function refreshCache(): Promise<void> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    console.log('[cache] refreshing...')
    const start = Date.now()
    const cfg = loadConfig()
    const username = getUsername()
    const next: CacheData = {
      user: null,
      repos: [],
      events: [],
      following: {},
      followingNames: [],
      heatmap: [],
      totalStars: 0,
      totalCommits: 0,
      totalRepos: 0,
      lastUpdated: null,
    }

    next.user = await getUser(username).catch(() => null)
    const repos = await getRepos(username).catch(() => [])
    next.repos = repos
    next.totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0)
    next.totalRepos = repos.length
    await enrichRepos(repos, username)

    const events = await getAllEvents(username).catch(() => [])
    next.events = events

    try {
      const { days, totalCommits } = await getContributions(username)
      next.heatmap = days
      next.totalCommits = totalCommits
    } catch {
      next.heatmap = buildHeatmapFromEvents(events)
      next.totalCommits = events
        .filter((e) => e.type === 'PushEvent')
        .reduce((s, e) => s + (e.payload.size || 0), 0)
    }

    let followingNames = cfg.following?.length ? cfg.following : []
    if (!followingNames.length) {
      followingNames = await getUserFollowing(username, 20).catch(() => [])
    }
    next.followingNames = followingNames

    await Promise.all(
      followingNames.map(async (name) => {
        try {
          const [user, fe, fr] = await Promise.all([
            getUser(name),
            getAllEvents(name).catch(() => []),
            getRepos(name).catch(() => []),
          ])
          next.following[name] = {
            user,
            events: fe,
            repos: fr.slice(0, 5),
          }
        } catch (err) {
          console.error(`[cache] following ${name}:`, err)
        }
      }),
    )

    next.lastUpdated = new Date().toISOString()
    cache = next
    lastRefresh = Date.now()
    recordStarHistory(next.totalStars)
    console.log(`[cache] refreshed in ${Date.now() - start}ms`)
  })().finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}

export async function getCacheWithRefresh(): Promise<CacheData> {
  // First load (or failed previous load): wait until cache is populated.
  if (!cache.lastUpdated) {
    await refreshCache()
    return cache
  }
  // Stale cache: serve current data and refresh in the background.
  if (Date.now() - lastRefresh > 30 * 60 * 1000) {
    refreshCache().catch(console.error)
  }
  return cache
}

export function startRefreshLoop() {
  refreshCache().catch(console.error)
  setInterval(() => refreshCache().catch(console.error), 30 * 60 * 1000)
}

export type { FollowingCache }
