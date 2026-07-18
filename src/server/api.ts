import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import {
  getCacheWithRefresh,
  getStarHistory,
  refreshCache,
  startRefreshLoop,
} from './cache'

// Warm GitHub cache as soon as server functions are loaded.
startRefreshLoop()
import {
  loadSettings,
  saveSettings,
  getUsername,
  getPublicSettings,
  validateAdminPassword,
  passkeyInfos,
  reloadSettings,
  hasPasskeys,
  loadConfig,
} from './config'
import { eventsToActivities } from './activities'
import type {
  ActivityItem,
  FollowingItem,
  MeResponse,
  Settings,
} from './types'
import { buildRepoContents, buildRepoDetail } from './repoDetail'
import {
  passkeyRegisterStart,
  passkeyRegisterFinish,
  passkeyLoginStart,
  passkeyLoginFinish,
  passkeyUpdate,
  passkeyDelete,
  passkeyReset,
} from './passkey'

function getEventFromHeaders(): { headers: Headers } {
  const headers = getRequestHeaders()
  return { headers }
}

export const getMe = createServerFn({ method: 'GET' }).handler(
  async (): Promise<MeResponse> => {
    const c = await getCacheWithRefresh()
    if (!c.user) throw new Error('cache not ready')
    const cfg = loadConfig()
    const loc = cfg.location || c.user.location
    return {
      user: c.user,
      stats: {
        total_stars: c.totalStars,
        total_commits: c.totalCommits,
        total_repos: c.totalRepos,
      },
      gender: cfg.gender || '',
      location: loc,
      following_count: c.user.following,
      last_updated: c.lastUpdated,
    }
  }
)

export const getRepos = createServerFn({ method: 'GET' }).handler(
  async () => {
    const c = await getCacheWithRefresh()
    return c.repos
  }
)

export const getRepoDetailFn = createServerFn({ method: 'GET' })
  .validator((d: { name: string }) => d)
  .handler(async ({ data }) => {
    return buildRepoDetail(data.name)
  })

export const getRepoContentsFn = createServerFn({ method: 'GET' })
  .validator((d: { name: string; path?: string }) => d)
  .handler(async ({ data }) => {
    return buildRepoContents(data.name, data.path || '')
  })

export const getActivity = createServerFn({ method: 'GET' })
  .validator((d: { username?: string; limit?: number }) => d)
  .handler(async ({ data }) => {
    const c = await getCacheWithRefresh()
    const targetUsername = data.username || getUsername()
    const targetLimit = data.limit || 20
    let events = c.events
    let actor = c.user?.login || ''
    let avatar = c.user?.avatar_url || ''
    if (targetUsername !== getUsername()) {
      const fc = c.following[targetUsername]
      if (fc) {
        events = fc.events
        actor = fc.user.login
        avatar = fc.user.avatar_url
      } else {
        events = []
      }
    }
    let items = eventsToActivities(events, actor, avatar)
    if (items.length > targetLimit) items = items.slice(0, targetLimit)
    return items
  })

export const getFollowing = createServerFn({ method: 'GET' }).handler(
  async (): Promise<FollowingItem[]> => {
    const c = await getCacheWithRefresh()
    const result: FollowingItem[] = []
    for (const name of c.followingNames) {
      const fc = c.following[name]
      if (!fc?.user) continue
      const recentEvents = eventsToActivities(
        fc.events,
        fc.user.login,
        fc.user.avatar_url
      ).slice(0, 5)
      result.push({
        username: fc.user.login,
        avatar_url: fc.user.avatar_url,
        bio: fc.user.bio,
        last_active: fc.events[0]?.created_at || null,
        recent_repos: fc.repos,
        recent_events: recentEvents,
      })
    }
    return result
  }
)

export const getFeed = createServerFn({ method: 'GET' })
  .validator((d: { limit?: number }) => d)
  .handler(async ({ data }): Promise<ActivityItem[]> => {
    const c = await getCacheWithRefresh()
    const targetLimit = data.limit || 50
    const all: ActivityItem[] = []
    if (c.user) {
      all.push(
        ...eventsToActivities(c.events, c.user.login, c.user.avatar_url)
      )
    }
    for (const name of c.followingNames) {
      const fc = c.following[name]
      if (fc?.user) {
        all.push(
          ...eventsToActivities(fc.events, fc.user.login, fc.user.avatar_url)
        )
      }
    }
    all.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    return all.slice(0, targetLimit)
  })

export const getHeatmap = createServerFn({ method: 'GET' }).handler(
  async () => {
    const c = await getCacheWithRefresh()
    return c.heatmap
  }
)

export const getStats = createServerFn({ method: 'GET' }).handler(
  async () => {
    const c = await getCacheWithRefresh()
    return {
      total_stars: c.totalStars,
      total_commits: c.totalCommits,
      total_repos: c.totalRepos,
    }
  }
)

export const getStarHistoryFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    return getStarHistory()
  }
)

export const getHealth = createServerFn({ method: 'GET' }).handler(
  async () => {
    const c = await getCacheWithRefresh()
    return { ok: true, last_updated: c.lastUpdated }
  }
)

export const getSettings = createServerFn({ method: 'GET' }).handler(
  async () => {
    return getPublicSettings()
  }
)

export const adminLogin = createServerFn({ method: 'POST' })
  .validator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    if (!validateAdminPassword(data.password))
      throw new Error('invalid password')
    return { ok: true }
  })

export const getAdminSettings = createServerFn({ method: 'GET' }).handler(
  async () => {
    const st = loadSettings()
    return { ...st, passkey_items: passkeyInfos(st), has_passkey: hasPasskeys(st) }
  }
)

export const saveSettingsFn = createServerFn({ method: 'POST' })
  .validator((d: Settings) => d)
  .handler(async ({ data }) => {
    const current = loadSettings()
    const next: Settings = {
      ...current,
      title: data.title || 'GitShow',
      github_username: data.github_username || '',
      github_url: data.github_url || '',
      github_token: data.github_token ?? current.github_token,
      contact_label: data.contact_label || '',
      contact_url: data.contact_url || '',
      homepage_repo_count: data.homepage_repo_count || 6,
      homepage_repos: data.homepage_repos || [],
      social_links: data.social_links || [],
      theme: 'green',
      admin_password: data.admin_password ?? current.admin_password,
      passkeys: current.passkeys,
      passkey_credentials: current.passkey_credentials,
    }
    saveSettings(next)
    reloadSettings()
    return next
  })

export const refreshCacheFn = createServerFn({ method: 'POST' }).handler(
  async () => {
    refreshCache().catch(console.error)
    return { status: 'refreshing' }
  }
)

export const passkeyRegisterStartFn = createServerFn({ method: 'POST' }).handler(
  async () => {
    return passkeyRegisterStart(getEventFromHeaders())
  }
)

export const passkeyRegisterFinishFn = createServerFn({ method: 'POST' })
  .validator((d: { sessionId: string; credential: unknown; note?: string }) => d)
  .handler(async ({ data }) => {
    return passkeyRegisterFinish(
      getEventFromHeaders(),
      data.sessionId,
      data.credential as any,
      data.note || ''
    )
  })

export const passkeyLoginStartFn = createServerFn({ method: 'POST' }).handler(
  async () => {
    return passkeyLoginStart(getEventFromHeaders())
  }
)

export const passkeyLoginFinishFn = createServerFn({ method: 'POST' })
  .validator((d: { sessionId: string; credential: unknown }) => d)
  .handler(async ({ data }) => {
    return passkeyLoginFinish(
      getEventFromHeaders(),
      data.sessionId,
      data.credential as any
    )
  })

export const passkeyResetFn = createServerFn({ method: 'POST' }).handler(
  async () => {
    return passkeyReset()
  }
)

export const passkeyUpdateFn = createServerFn({ method: 'POST' })
  .validator((d: { id: string; note: string }) => d)
  .handler(async ({ data }) => {
    return passkeyUpdate(data.id, data.note)
  })

export const passkeyDeleteFn = createServerFn({ method: 'POST' })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    return passkeyDelete(data.id)
  })
