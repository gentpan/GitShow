import { getToken } from './config'
import type { GitHubEvent, GitHubRepo, GitHubUser, HeatmapDay } from './types'

async function githubRequest(method: string, url: string, body?: unknown): Promise<unknown> {
  const token = getToken()
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  }
  if (token && token !== 'ghp_your_token_here') {
    headers.Authorization = `Bearer ${token}`
  }
  if (body) headers['Content-Type'] = 'application/json'

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`github api ${url}: ${res.status} ${text}`)
  }
  return text ? JSON.parse(text) : null
}

export async function getUser(username: string): Promise<GitHubUser> {
  return githubRequest('GET', `https://api.github.com/users/${username}`) as Promise<GitHubUser>
}

async function getUserRepos(username: string): Promise<GitHubRepo[]> {
  const url = `https://api.github.com/users/${username}/repos?sort=updated&per_page=100&type=owner`
  const repos = (await githubRequest('GET', url)) as GitHubRepo[]
  return repos.filter((r) => !r.private)
}

async function getUserOrgRepos(): Promise<GitHubRepo[]> {
  const orgs = (await githubRequest('GET', 'https://api.github.com/user/orgs?per_page=100')) as { login: string }[]
  const results = await Promise.all(
    orgs.map(async (o) => {
      const url = `https://api.github.com/orgs/${o.login}/repos?sort=updated&per_page=100`
      try {
        const repos = (await githubRequest('GET', url)) as GitHubRepo[]
        return repos.filter((r) => !r.private)
      } catch {
        return []
      }
    }),
  )
  return results.flat()
}

export async function getRepos(username: string): Promise<GitHubRepo[]> {
  const [userRepos, orgRepos] = await Promise.all([
    getUserRepos(username).catch(() => [] as GitHubRepo[]),
    getUserOrgRepos().catch(() => [] as GitHubRepo[]),
  ])
  const seen = new Set<string>()
  const merged: GitHubRepo[] = []
  for (const r of [...userRepos, ...orgRepos]) {
    if (!seen.has(r.full_name)) {
      seen.add(r.full_name)
      merged.push(r)
    }
  }
  return merged
}

export async function getUserFollowing(username: string, limit: number): Promise<string[]> {
  const url = `https://api.github.com/users/${username}/following?per_page=100`
  const users = (await githubRequest('GET', url)) as GitHubUser[]
  return users.slice(0, limit).map((u) => u.login)
}

export async function getRepoLanguages(owner: string, repo: string): Promise<Record<string, number>> {
  return (await githubRequest('GET', `https://api.github.com/repos/${owner}/${repo}/languages`)) as Record<string, number>
}

export async function getLatestRelease(owner: string, repo: string): Promise<string> {
  try {
    const release = (await githubRequest('GET', `https://api.github.com/repos/${owner}/${repo}/releases/latest`)) as { tag_name: string }
    return release.tag_name || ''
  } catch {
    return ''
  }
}

export async function getEvents(username: string, page: number): Promise<GitHubEvent[]> {
  const url = `https://api.github.com/users/${username}/events/public?per_page=100&page=${page}`
  return (await githubRequest('GET', url)) as GitHubEvent[]
}

export async function getAllEvents(username: string): Promise<GitHubEvent[]> {
  const all: GitHubEvent[] = []
  for (let page = 1; page <= 3; page++) {
    try {
      const evts = await getEvents(username, page)
      if (!evts.length) break
      all.push(...evts)
    } catch (err) {
      if (page === 1) throw err
      break
    }
  }
  return all
}

export async function getContributions(username: string): Promise<{ days: HeatmapDay[]; totalCommits: number }> {
  const query = `{
    user(login: "${username}") {
      contributionsCollection {
        totalCommitContributions
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
              color
            }
          }
        }
      }
    }
  }`
  const resp = (await githubRequest('POST', 'https://api.github.com/graphql', { query })) as {
    data?: {
      user?: {
        contributionsCollection: {
          totalCommitContributions: number
          contributionCalendar: { weeks: { contributionDays: { date: string; contributionCount: number; color: string }[] }[] }
        }
      }
    }
    errors?: { message: string }[]
  }
  if (resp.errors?.length) throw new Error(resp.errors[0].message)
  if (!resp.data?.user) throw new Error('user not found')
  const cc = resp.data.user.contributionsCollection
  const days: HeatmapDay[] = []
  for (const week of cc.contributionCalendar.weeks) {
    for (const day of week.contributionDays) {
      days.push({ date: day.date, count: day.contributionCount, color: day.color })
    }
  }
  return { days, totalCommits: cc.totalCommitContributions }
}

export async function enrichRepos(repos: GitHubRepo[], defaultOwner: string): Promise<void> {
  await Promise.all(
    repos.map(async (repo, idx) => {
      let owner = defaultOwner
      let repoName = repo.name
      if (repo.full_name?.includes('/')) {
        const [o, n] = repo.full_name.split('/')
        owner = o
        repoName = n
      }
      const [langs, tag] = await Promise.all([
        getRepoLanguages(owner, repoName).catch(() => ({} as Record<string, number>)),
        getLatestRelease(owner, repoName).catch(() => ''),
      ])
      const total = Object.values(langs).reduce((a, b) => a + b, 0)
      const pct: Record<string, number> = {}
      for (const [k, v] of Object.entries(langs)) {
        pct[k] = total > 0 ? (v / total) * 100 : 0
      }
      repos[idx] = { ...repo, languages: langs, lang_pct: pct, latest_version: tag }
    }),
  )
}

export function buildHeatmapFromEvents(events: GitHubEvent[]): HeatmapDay[] {
  const counts: Record<string, number> = {}
  for (const e of events) {
    if (e.type === 'PushEvent') {
      const day = e.created_at.slice(0, 10)
      counts[day] = (counts[day] || 0) + (e.payload.size || 0)
    }
  }
  const days: HeatmapDay[] = []
  const now = new Date()
  for (let i = 364; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push({ date: key, count: counts[key] || 0 })
  }
  return days
}

export function parseRepoOwnerName(repo: GitHubRepo, defaultOwner: string): [string, string] {
  if (repo.full_name?.includes('/')) {
    const [owner, name] = repo.full_name.split('/')
    return [owner, name]
  }
  return [defaultOwner, repo.name]
}

export async function getRepoDetail(owner: string, repo: string): Promise<Record<string, unknown>> {
  return githubRequest('GET', `https://api.github.com/repos/${owner}/${repo}`) as Promise<Record<string, unknown>>
}

export async function getReadmeHtml(owner: string, repo: string): Promise<string | null> {
  const token = getToken()
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.html+json',
  }
  if (token && token !== 'ghp_your_token_here') {
    headers.Authorization = `Bearer ${token}`
  }
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`github readme ${owner}/${repo}: ${res.status}`)
  return res.text()
}

interface GitHubContent {
  name: string
  path: string
  type: 'file' | 'dir'
  size: number
  html_url: string
}

export async function getRepoContents(owner: string, repo: string, path = ''): Promise<GitHubContent[]> {
  const suffix = path ? `/${path.split('/').map(encodeURIComponent).join('/')}` : ''
  const data = await githubRequest('GET', `https://api.github.com/repos/${owner}/${repo}/contents${suffix}`)
  if (Array.isArray(data)) return data as GitHubContent[]
  return [data as GitHubContent]
}

interface GitHubCommit {
  sha: string
  html_url: string
  commit: { message: string; author: { name: string; date: string } }
  author: { login: string; avatar_url: string } | null
}

export async function getRepoCommits(owner: string, repo: string, limit = 10): Promise<GitHubCommit[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${limit}`
  return (await githubRequest('GET', url)) as GitHubCommit[]
}
