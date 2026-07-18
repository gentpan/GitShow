import { langColor } from '@/lib/utils'

export interface LanguageStat {
  name: string
  size: number
  percentage: number
  color: string
}

export function aggregateLanguages(
  repos: { languages?: Record<string, number> }[],
  limit = 8,
): LanguageStat[] {
  const map: Record<string, number> = {}
  for (const repo of repos) {
    if (!repo.languages) continue
    for (const [lang, bytes] of Object.entries(repo.languages)) {
      map[lang] = (map[lang] || 0) + bytes
    }
  }
  const total = Object.values(map).reduce((a, b) => a + b, 0)
  if (!total) return []
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, size]) => ({
      name,
      size,
      percentage: Math.round((size / total) * 100),
      color: langColor(name),
    }))
}

export function getTotalContributions(heatmap: { count?: number }[]): number {
  return heatmap.reduce((sum, d) => sum + (d.count || 0), 0)
}

export function getYearsActive(heatmap: { date?: string; count?: number }[]): number {
  const active = heatmap.filter((d) => d.count && d.count > 0)
  if (!active.length) return 1
  const first = new Date(active[0].date || Date.now())
  const years = (Date.now() - first.getTime()) / (365.25 * 24 * 3600 * 1000)
  return Math.max(1, Math.ceil(years))
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)}MB`
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)}KB`
  return `${bytes} bytes`
}

/** GitHub contribution green scale (classic contribution graph). */
const GITHUB_GREEN = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'] as const

export function contributionColor(count: number): string {
  if (!count) return GITHUB_GREEN[0]
  if (count <= 2) return GITHUB_GREEN[1]
  if (count <= 5) return GITHUB_GREEN[2]
  if (count <= 10) return GITHUB_GREEN[3]
  return GITHUB_GREEN[4]
}

export interface HeatmapWeek {
  days: { date: string; count: number }[]
}

export function heatmapToWeeks(heatmap: { date: string; count: number }[]): HeatmapWeek[] {
  const weeks: HeatmapWeek[] = []
  for (let i = 0; i < heatmap.length; i += 7) {
    weeks.push({ days: heatmap.slice(i, i + 7) })
  }
  return weeks.slice(-52)
}

export function getMonthLabels(
  weeks: HeatmapWeek[],
  locale: 'zh' | 'en' = 'en',
): { label: string; col: number }[] {
  const months: { label: string; col: number }[] = []
  let lastMonth = -1
  weeks.forEach((week, index) => {
    const first = week.days[0]
    if (!first?.date) return
    const month = new Date(first.date).getMonth()
    if (month !== lastMonth) {
      months.push({
        label: new Date(first.date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
          month: 'short',
        }),
        col: index,
      })
      lastMonth = month
    }
  })
  return months
}

export interface ExternalContrib {
  repoName: string
  owner: string
  language: string | null
  prCount: number
  commitCount: number
  stargazerCount: number
  url: string
}

/** Only repos not owned by the site user (true external participation). */
export function deriveExternalContributions(
  activity: any[],
  selfUsername?: string | null,
): ExternalContrib[] {
  const self = (selfUsername || '').toLowerCase()
  const map = new Map<string, ExternalContrib>()
  for (const item of activity) {
    const repoName = item.repo || ''
    if (!repoName) continue
    const owner = repoName.split('/')[0] || ''
    if (self && owner.toLowerCase() === self) continue
    if (item.type !== 'PullRequestEvent' && item.type !== 'PushEvent') continue
    const existing = map.get(repoName) || {
      repoName,
      owner,
      language: null,
      prCount: 0,
      commitCount: 0,
      stargazerCount: 0,
      url: item.repo_url || `https://github.com/${repoName}`,
    }
    if (item.type === 'PullRequestEvent') existing.prCount += 1
    if (item.type === 'PushEvent') existing.commitCount += 1
    map.set(repoName, existing)
  }
  return [...map.values()]
    .sort((a, b) => b.commitCount + b.prCount - (a.commitCount + a.prCount))
    .slice(0, 4)
}

export interface FocusArea {
  label: string
  icon: string
  percentage: number
}

/** Aggregate language bytes into focus areas for Tech Stack (not raw language chips). */
export function deriveFocusAreas(languages: LanguageStat[]): FocusArea[] {
  const categories: { label: string; icon: string; langs: string[] }[] = [
    { label: '全栈 Web', icon: 'fas fa-layer-group', langs: ['TypeScript', 'JavaScript', 'Python', 'Ruby', 'PHP', 'HTML', 'CSS', 'Vue', 'Svelte'] },
    { label: '系统与后端', icon: 'fas fa-microchip', langs: ['Rust', 'Go', 'C', 'C++', 'Java', 'C#'] },
    { label: '移动端', icon: 'fas fa-mobile-screen', langs: ['Swift', 'Kotlin', 'Dart'] },
    { label: '数据与智能', icon: 'fas fa-chart-line', langs: ['R', 'Julia', 'Jupyter Notebook'] },
    { label: '运维与基础设施', icon: 'fas fa-server', langs: ['Shell', 'Dockerfile', 'HCL', 'Makefile'] },
  ]

  const total = languages.reduce((s, l) => s + l.size, 0)
  if (!total) return []

  const areas: FocusArea[] = []
  for (const cat of categories) {
    const size = languages
      .filter((l) => cat.langs.includes(l.name))
      .reduce((s, l) => s + l.size, 0)
    if (!size) continue
    areas.push({
      label: cat.label,
      icon: cat.icon,
      percentage: Math.round((size / total) * 100),
    })
  }

  return areas.sort((a, b) => b.percentage - a.percentage).slice(0, 4)
}
