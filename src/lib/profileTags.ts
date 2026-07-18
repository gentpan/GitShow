import type { MessageKey } from '@/lib/i18n'

export interface ProfileTag {
  key: MessageKey
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

const LANGUAGE_CATEGORIES: { key: MessageKey; languages: string[]; icon: string }[] = [
  { key: 'tag.fullstack', languages: ['TypeScript', 'JavaScript', 'Python', 'Ruby', 'PHP'], icon: 'fas fa-layer-group' },
  { key: 'tag.systems', languages: ['Rust', 'Go', 'C', 'C++'], icon: 'fas fa-microchip' },
  { key: 'tag.mobile', languages: ['Swift', 'Kotlin', 'Dart'], icon: 'fas fa-mobile-screen' },
  { key: 'tag.data', languages: ['R', 'Julia'], icon: 'fas fa-chart-line' },
  { key: 'tag.ops', languages: ['Shell', 'Dockerfile', 'HCL'], icon: 'fas fa-server' },
]

const MAX_TAGS = 4

function languageCategory(language: string): ProfileTag | null {
  for (const cat of LANGUAGE_CATEGORIES) {
    if (cat.languages.includes(language)) {
      return { key: cat.key, icon: cat.icon }
    }
  }
  return null
}

function pushUnique(tags: ProfileTag[], tag: ProfileTag) {
  if (!tags.some((t) => t.key === tag.key)) tags.push(tag)
}

export function generateProfileTags(input: ProfileTagInput): ProfileTag[] {
  const tags: ProfileTag[] = []

  if (input.totalStars > 1000) {
    pushUnique(tags, { key: 'tag.starAuthor', icon: 'fas fa-fire' })
  } else if (input.totalStars > 100) {
    pushUnique(tags, { key: 'tag.rising', icon: 'fas fa-star' })
  }

  if (input.topLanguage) {
    const cat = languageCategory(input.topLanguage)
    if (cat) pushUnique(tags, cat)
  }

  if (input.totalContributions > 1000) {
    pushUnique(tags, { key: 'tag.active', icon: 'fas fa-bolt' })
  } else if (input.totalContributions > 365) {
    pushUnique(tags, { key: 'tag.consistent', icon: 'fas fa-calendar-check' })
  }

  if (input.yearsActive > 5) {
    pushUnique(tags, { key: 'tag.senior', icon: 'fas fa-medal' })
  }

  if ((input.languageCount || 0) >= 6) {
    pushUnique(tags, { key: 'tag.polyglot', icon: 'fas fa-globe' })
  }

  if (input.followers > 1000) {
    pushUnique(tags, { key: 'tag.influencer', icon: 'fas fa-bullhorn' })
  } else if (input.followers > 100) {
    pushUnique(tags, { key: 'tag.community', icon: 'fas fa-user-group' })
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
