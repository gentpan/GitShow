export interface Config {
  username: string
  token: string
  following: string[]
  gender?: string
  location?: string
}

export interface SocialLink {
  icon: string
  url: string
  color?: string
}

export interface PasskeyRecord {
  id: string
  note: string
  created_at?: string
  last_used_at?: string
  credential: any
}

export interface PasskeyInfo {
  id: string
  note: string
  created_at?: string
  last_used_at?: string
}

export interface Settings {
  title: string
  github_username: string
  github_url: string
  github_token: string
  contact_label: string
  contact_url: string
  homepage_repo_count: number
  homepage_repos: string[]
  social_links: SocialLink[]
  theme: string
  admin_password: string
  passkeys?: PasskeyRecord[]
  passkey_credentials?: any[]
}

export interface PublicSettings {
  title: string
  github_username: string
  github_url: string
  contact_label: string
  contact_url: string
  homepage_repo_count: number
  homepage_repos: string[]
  social_links: SocialLink[]
  theme: string
  has_admin_password: boolean
  has_github_token: boolean
  has_passkey: boolean
}

export interface GitHubUser {
  login: string
  avatar_url: string
  html_url: string
  bio: string
  public_repos: number
  followers: number
  following: number
  location: string
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string
  html_url: string
  language: string | null
  private: boolean
  stargazers_count: number
  forks_count: number
  updated_at: string
  languages?: Record<string, number>
  lang_pct?: Record<string, number>
  latest_version?: string
}

export interface GitHubRepoDetail extends GitHubRepo {
  topics?: string[]
  default_branch?: string
  created_at?: string
  pushed_at?: string
  open_issues_count?: number
  watchers_count?: number
  homepage?: string
  license?: { spdx_id: string; name: string } | null
}

export interface RepoContentItem {
  name: string
  path: string
  type: 'file' | 'dir'
  size: number
  html_url: string
}

export interface RepoCommitItem {
  sha: string
  message: string
  html_url: string
  author: string
  avatar_url: string
  date: string
}

export interface RepoDetailResponse {
  repo: GitHubRepoDetail
  readme_html: string | null
  contents: RepoContentItem[]
  commits: RepoCommitItem[]
}

export interface CommitInfo {
  sha: string
  message: string
  url: string
}

export interface GitHubEvent {
  id: string
  type: string
  actor: { login: string; avatar_url: string }
  repo: { name: string; url: string }
  payload: {
    size?: number
    ref?: string
    ref_type?: string
    commits?: CommitInfo[]
    action?: string
    description?: string
    issue?: { title: string; html_url: string; number: number }
    pull_request?: { title: string; html_url: string; number: number; state: string; merged: boolean }
    forkee?: { full_name: string; html_url: string }
  }
  created_at: string
}

export interface HeatmapDay {
  date: string
  count: number
  color?: string
}

export interface ActivityItem {
  id: string
  type: string
  actor: string
  actor_url: string
  avatar_url: string
  repo: string
  repo_url: string
  commits: CommitInfo[]
  message: string
  action: string
  target: string
  target_url: string
  created_at: string
}

export interface FollowingItem {
  username: string
  avatar_url: string
  bio: string
  last_active: string | null
  recent_repos: GitHubRepo[]
  recent_events: ActivityItem[]
}

export interface StarHistoryPoint {
  date: string
  stars: number
}

export interface FollowingCache {
  user: GitHubUser
  events: GitHubEvent[]
  repos: GitHubRepo[]
}

export interface CacheData {
  user: GitHubUser | null
  repos: GitHubRepo[]
  events: GitHubEvent[]
  following: Record<string, FollowingCache>
  followingNames: string[]
  heatmap: HeatmapDay[]
  totalStars: number
  totalCommits: number
  totalRepos: number
  lastUpdated: string | null
}

export interface MeResponse {
  user: GitHubUser
  stats: { total_stars: number; total_commits: number; total_repos: number }
  gender: string
  location: string
  following_count: number
  last_updated: string | null
}
