import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { loadConfig, loadSettings, getUsername } from './config'
import {
  getUser,
  getRepos,
  getUserRepos,
  getAllEvents,
  getEvents,
  getContributions,
  getUserFollowing,
  enrichRepos,
  buildHeatmapFromEvents,
  resetApiCallCount,
  getApiCallCount,
} from './github'
import { ensureAvatars } from './avatars'
import type { CacheData, FollowingCache, StarHistoryPoint } from './types'

/** Full GitHub sync interval. Portfolio data does not need sub-hour freshness. */
export const CACHE_TTL_MS = 60 * 60 * 1000

const FOLLOWING_SYNC_LIMIT = 20
const FOLLOWING_EVENT_PAGES = 1
const FOLLOWING_REPO_LIMIT = 5

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
let loopStarted = false

export function getCache(): CacheData {
  return cache
}

function ensureRefreshLoop() {
  if (loopStarted) return
  loopStarted = true
  setInterval(() => refreshCache().catch(console.error), CACHE_TTL_MS)
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
  ensureRefreshLoop()
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    console.log('[cache] refreshing...')
    const start = Date.now()
    resetApiCallCount()
    const cfg = loadConfig()
    const settings = loadSettings()
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
    // Languages for all repos (tech stack); releases only for selected project cards.
    await enrichRepos(repos, username, {
      releaseRepoNames: settings.homepage_repos || [],
    })

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
      followingNames = await getUserFollowing(username, FOLLOWING_SYNC_LIMIT).catch(() => [])
    } else {
      followingNames = followingNames.slice(0, FOLLOWING_SYNC_LIMIT)
    }
    next.followingNames = followingNames

    await Promise.all(
      followingNames.map(async (name) => {
        try {
          // Light sync: avoid getRepos() which also re-fetches the authed user's org repos.
          const [user, fe, fr] = await Promise.all([
            getUser(name),
            getEvents(name, FOLLOWING_EVENT_PAGES).catch(() => []),
            getUserRepos(name)
              .then((list) => list.slice(0, FOLLOWING_REPO_LIMIT))
              .catch(() => []),
          ])
          next.following[name] = {
            user,
            events: fe,
            repos: fr,
          }
        } catch (err) {
          console.error(`[cache] following ${name}:`, err)
        }
      }),
    )

    const avatarEntries = [
      ...(next.user ? [{ login: next.user.login, avatar_url: next.user.avatar_url }] : []),
      ...followingNames
        .map((name) => next.following[name]?.user)
        .filter(Boolean)
        .map((u) => ({ login: u!.login, avatar_url: u!.avatar_url })),
    ]
    await ensureAvatars(avatarEntries)

    next.lastUpdated = new Date().toISOString()
    cache = next
    lastRefresh = Date.now()
    recordStarHistory(next.totalStars)
    console.log(
      `[cache] refreshed in ${Date.now() - start}ms · github_calls=${getApiCallCount()} · repos=${next.totalRepos} · following=${followingNames.length} · avatars=${avatarEntries.length}`,
    )
  })().finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}

export async function getCacheWithRefresh(): Promise<CacheData> {
  ensureRefreshLoop()
  // First load (or failed previous load): wait until cache is populated.
  if (!cache.lastUpdated) {
    await refreshCache()
    return cache
  }
  // Stale cache: serve current data and refresh in the background.
  if (Date.now() - lastRefresh > CACHE_TTL_MS) {
    refreshCache().catch(console.error)
  }
  return cache
}

export function startRefreshLoop() {
  ensureRefreshLoop()
  refreshCache().catch(console.error)
}

export type { FollowingCache }
