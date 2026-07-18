export interface ProfileTag {
  label: string
  icon: string
}

export interface ProfileTagInput {
  totalStars: number
  totalRepos: number
  totalForks?: number
  totalCommits?: number
  followers: number
  following?: number
  totalContributions: number
  yearsActive: number
  topLanguage?: string | null
  languageCount?: number
  streakDays?: number
  activeDays?: number
  weekendShare?: number
}

const LANGUAGE_CATEGORIES: Record<string, { languages: string[]; icon: string }> = {
  全栈: {
    languages: ['TypeScript', 'JavaScript', 'Python', 'Ruby', 'PHP'],
    icon: 'fas fa-layer-group',
  },
  系统: {
    languages: ['Rust', 'Go', 'C', 'C++'],
    icon: 'fas fa-microchip',
  },
  移动端: {
    languages: ['Swift', 'Kotlin', 'Dart'],
    icon: 'fas fa-mobile-screen',
  },
  数据: {
    languages: ['R', 'Julia'],
    icon: 'fas fa-chart-line',
  },
  运维: {
    languages: ['Shell', 'Dockerfile', 'HCL'],
    icon: 'fas fa-server',
  },
}

/** Keep homepage badges tight and professional. */
const MAX_TAGS = 4

function languageCategory(language: string): ProfileTag | null {
  for (const [label, meta] of Object.entries(LANGUAGE_CATEGORIES)) {
    if (meta.languages.includes(language)) {
      return { label, icon: meta.icon }
    }
  }
  return null
}

function pushUnique(tags: ProfileTag[], tag: ProfileTag) {
  if (!tags.some((t) => t.label === tag.label)) tags.push(tag)
}

/** Professional profile tags (max 4). */
export function generateProfileTags(input: ProfileTagInput): ProfileTag[] {
  const tags: ProfileTag[] = []

  if (input.totalStars > 1000) {
    pushUnique(tags, { label: '高星作者', icon: 'fas fa-fire' })
  } else if (input.totalStars > 100) {
    pushUnique(tags, { label: '新锐项目', icon: 'fas fa-star' })
  }

  if (input.topLanguage) {
    const cat = languageCategory(input.topLanguage)
    if (cat) pushUnique(tags, cat)
  }

  if (input.totalContributions > 1000) {
    pushUnique(tags, { label: '高活跃', icon: 'fas fa-bolt' })
  } else if (input.totalContributions > 365) {
    pushUnique(tags, { label: '持续贡献', icon: 'fas fa-calendar-check' })
  }

  if (input.yearsActive > 5) {
    pushUnique(tags, { label: '资深开发', icon: 'fas fa-medal' })
  }

  if ((input.languageCount || 0) >= 6) {
    pushUnique(tags, { label: '多语言', icon: 'fas fa-globe' })
  }

  if (input.followers > 1000) {
    pushUnique(tags, { label: '社区影响力', icon: 'fas fa-bullhorn' })
  } else if (input.followers > 100) {
    pushUnique(tags, { label: '社区成员', icon: 'fas fa-user-group' })
  }

  return tags.slice(0, MAX_TAGS)
}

export function getYearsActiveFromCreatedAt(createdAt?: string | null): number {
  if (!createdAt) return 0
  const start = new Date(createdAt).getTime()
  if (Number.isNaN(start)) return 0
  return Math.max(0, (Date.now() - start) / (365.25 * 24 * 3600 * 1000))
}

export function getContributionStreak(heatmap: { date?: string; count?: number }[]): number {
  if (!heatmap.length) return 0
  const days = [...heatmap]
    .filter((d) => d.date)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 0
  for (const day of days) {
    const dayDate = new Date(day.date as string)
    dayDate.setHours(0, 0, 0, 0)
    if (dayDate > today) continue

    const expected = new Date(today)
    expected.setDate(today.getDate() - streak)
    if (dayDate.getTime() !== expected.getTime()) {
      if (streak === 0 && day.count && day.count > 0) {
        const yesterday = new Date(today)
        yesterday.setDate(today.getDate() - 1)
        if (dayDate.getTime() === yesterday.getTime()) {
          streak = 1
          continue
        }
      }
      break
    }
    if ((day.count || 0) > 0) streak++
    else break
  }
  return streak
}

export function getActiveDays(heatmap: { count?: number }[]): number {
  return heatmap.filter((d) => (d.count || 0) > 0).length
}

export function getWeekendContributionShare(
  heatmap: { date?: string; count?: number }[],
): number {
  let total = 0
  let weekend = 0
  for (const day of heatmap) {
    const count = day.count || 0
    if (!count || !day.date) continue
    total += count
    const wd = new Date(day.date).getDay()
    if (wd === 0 || wd === 6) weekend += count
  }
  if (!total) return 0
  return weekend / total
}

export { LANGUAGE_CATEGORIES }
