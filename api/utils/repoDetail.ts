import { getCache } from './cache'
import { getUsername } from './config'
import {
  getReadmeHtml,
  getRepoCommits,
  getRepoContents,
  getRepoDetail,
  parseRepoOwnerName,
} from './github'
import type {
  GitHubRepo,
  RepoCommitItem,
  RepoContentItem,
  RepoDetailResponse,
} from './types'

export function findCachedRepo(name: string): GitHubRepo | undefined {
  const decoded = decodeURIComponent(name)
  const repos = getCache().repos
  return repos.find(
    (r) =>
      r.name === decoded ||
      r.full_name === decoded ||
      r.full_name.endsWith(`/${decoded}`),
  )
}

function mapContents(items: Awaited<ReturnType<typeof getRepoContents>>): RepoContentItem[] {
  return items
    .filter((item) => item.name !== '.git')
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
      return a.name.localeCompare(b.name)
    })
    .map((item) => ({
      name: item.name,
      path: item.path,
      type: item.type,
      size: item.size,
      html_url: item.html_url,
    }))
}

function mapCommits(commits: Awaited<ReturnType<typeof getRepoCommits>>): RepoCommitItem[] {
  return commits.map((c) => ({
    sha: c.sha.slice(0, 7),
    message: c.commit.message.split('\n')[0],
    html_url: c.html_url,
    author: c.author?.login || c.commit.author.name || 'unknown',
    avatar_url: c.author?.avatar_url || '',
    date: c.commit.author.date,
  }))
}

export async function buildRepoDetail(name: string): Promise<RepoDetailResponse> {
  const cached = findCachedRepo(name)
  if (!cached) throw new Error('repo not found')

  const [owner, repoName] = parseRepoOwnerName(cached, getUsername())
  const [detail, readmeHtml, contents, commits] = await Promise.all([
    getRepoDetail(owner, repoName),
    getReadmeHtml(owner, repoName).catch(() => null),
    getRepoContents(owner, repoName).catch(() => []),
    getRepoCommits(owner, repoName, 10).catch(() => []),
  ])

  const license = detail.license as { spdx_id?: string; name?: string } | null

  return {
    repo: {
      ...cached,
      topics: (detail.topics as string[]) || [],
      default_branch: (detail.default_branch as string) || 'main',
      created_at: detail.created_at as string,
      pushed_at: detail.pushed_at as string,
      open_issues_count: (detail.open_issues_count as number) || 0,
      watchers_count: (detail.watchers_count as number) || 0,
      homepage: (detail.homepage as string) || '',
      license: license?.spdx_id ? { spdx_id: license.spdx_id, name: license.name || license.spdx_id } : null,
    },
    readme_html: readmeHtml,
    contents: mapContents(contents),
    commits: mapCommits(commits),
  }
}

export async function buildRepoContents(name: string, path: string): Promise<RepoContentItem[]> {
  const cached = findCachedRepo(name)
  if (!cached) throw new Error('repo not found')
  const [owner, repoName] = parseRepoOwnerName(cached, getUsername())
  const contents = await getRepoContents(owner, repoName, path)
  return mapContents(contents)
}
