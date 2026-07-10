import {
  loadSettings,
  saveSettings,
  getUsername,
  getPublicSettings,
  validateAdminPassword,
  passkeyInfos,
  reloadSettings,
  hasPasskeys,
} from './config'
import { getCache, refreshCache, getStarHistory } from './cache'
import { eventsToActivities } from './activities'
import type { ActivityItem, FollowingItem, MeResponse, Settings } from './types'
import {
  passkeyRegisterStart,
  passkeyRegisterFinish,
  passkeyLoginStart,
  passkeyLoginFinish,
  passkeyUpdate,
  passkeyDelete,
  passkeyReset,
} from './passkey'

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function err(message: string, status = 400) {
  return json({ error: message }, status)
}

export async function handleApiRequest(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const path = url.pathname.replace(/^\/api\/?/, '')
  const method = request.method

  try {
    if (method === 'GET' && path === 'me') {
      const c = getCache()
      if (!c.user) return err('cache not ready', 503)
      const cfg = await import('./config').then((m) => m.loadConfig())
      const loc = cfg.location || c.user.location
      const body: MeResponse = {
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
      return json(body)
    }

    if (method === 'GET' && path === 'repos') return json(getCache().repos)

    if (method === 'GET' && path === 'activity') {
      const c = getCache()
      const username = url.searchParams.get('username') || getUsername()
      const limit = parseInt(url.searchParams.get('limit') || '20', 10)
      let events = c.events
      let actor = c.user?.login || ''
      let avatar = c.user?.avatar_url || ''
      if (username !== getUsername()) {
        const fc = c.following[username]
        if (fc) {
          events = fc.events
          actor = fc.user.login
          avatar = fc.user.avatar_url
        } else {
          events = []
        }
      }
      let items = eventsToActivities(events, actor, avatar)
      if (items.length > limit) items = items.slice(0, limit)
      return json(items)
    }

    if (method === 'GET' && path === 'following') {
      const c = getCache()
      const result: FollowingItem[] = []
      for (const name of c.followingNames) {
        const fc = c.following[name]
        if (!fc?.user) continue
        const recentEvents = eventsToActivities(fc.events, fc.user.login, fc.user.avatar_url).slice(0, 5)
        result.push({
          username: fc.user.login,
          avatar_url: fc.user.avatar_url,
          bio: fc.user.bio,
          last_active: fc.events[0]?.created_at || null,
          recent_repos: fc.repos,
          recent_events: recentEvents,
        })
      }
      return json(result)
    }

    if (method === 'GET' && path === 'feed') {
      const c = getCache()
      const limit = parseInt(url.searchParams.get('limit') || '50', 10)
      const all: ActivityItem[] = []
      if (c.user) {
        all.push(...eventsToActivities(c.events, c.user.login, c.user.avatar_url))
      }
      for (const name of c.followingNames) {
        const fc = c.following[name]
        if (fc?.user) {
          all.push(...eventsToActivities(fc.events, fc.user.login, fc.user.avatar_url))
        }
      }
      all.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
      return json(all.slice(0, limit))
    }

    if (method === 'GET' && path === 'heatmap') return json(getCache().heatmap)
    if (method === 'GET' && path === 'stats') {
      const c = getCache()
      return json({ total_stars: c.totalStars, total_commits: c.totalCommits, total_repos: c.totalRepos })
    }
    if (method === 'GET' && path === 'stars-history') return json(getStarHistory())
    if (method === 'GET' && path === 'settings') return json(getPublicSettings())
    if (method === 'GET' && path === 'health') {
      return json({ ok: true, last_updated: getCache().lastUpdated })
    }

    if (method === 'POST' && path === 'admin/login') {
      const body = (await request.json()) as { password?: string }
      if (!validateAdminPassword(body.password || '')) return err('invalid password', 401)
      return json({ ok: true })
    }

    if (method === 'GET' && path === 'admin/settings') {
      const st = loadSettings()
      return json({ ...st, passkey_items: passkeyInfos(st), has_passkey: hasPasskeys(st) })
    }

    if (method === 'POST' && path === 'admin/settings') {
      const incoming = (await request.json()) as Settings
      const current = loadSettings()
      const next: Settings = {
        ...current,
        title: incoming.title || 'GitShow',
        github_username: incoming.github_username || '',
        github_url: incoming.github_url || '',
        github_token: incoming.github_token ?? current.github_token,
        contact_label: incoming.contact_label || '',
        contact_url: incoming.contact_url || '',
        homepage_repo_count: incoming.homepage_repo_count || 6,
        homepage_repos: incoming.homepage_repos || [],
        social_links: incoming.social_links || [],
        theme: incoming.theme || 'green',
        admin_password: incoming.admin_password ?? current.admin_password,
        passkeys: current.passkeys,
        passkey_credentials: current.passkey_credentials,
      }
      saveSettings(next)
      reloadSettings()
      return json(next)
    }

    if (method === 'POST' && path === 'refresh') {
      refreshCache().catch(console.error)
      return json({ status: 'refreshing' })
    }

    const event = { headers: request.headers }

    if (method === 'POST' && path === 'passkey/register/start') {
      return json(await passkeyRegisterStart(event))
    }
    if (method === 'POST' && path.startsWith('passkey/register/finish')) {
      const sessionId = url.searchParams.get('session_id') || ''
      const note = url.searchParams.get('note') || ''
      const body = await request.json()
      return json(await passkeyRegisterFinish(event, sessionId, body, note))
    }
    if (method === 'POST' && path === 'passkey/login/start') {
      return json(await passkeyLoginStart(event))
    }
    if (method === 'POST' && path.startsWith('passkey/login/finish')) {
      const sessionId = url.searchParams.get('session_id') || ''
      const body = await request.json()
      return json(await passkeyLoginFinish(event, sessionId, body))
    }
    if (method === 'POST' && path === 'passkey/reset') return json(passkeyReset())
    if (method === 'POST' && path === 'passkey/update') {
      const id = url.searchParams.get('id') || ''
      const body = (await request.json()) as { note?: string }
      return json(passkeyUpdate(id, body.note || ''))
    }
    if (method === 'POST' && path === 'passkey/delete') {
      const id = url.searchParams.get('id') || ''
      return json(passkeyDelete(id))
    }

    return err('not found', 404)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'internal error'
    return err(message, 500)
  }
}
