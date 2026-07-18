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
  /** Current consecutive contribution days ending today/yesterday */
  streakDays?: number
  /** Days with ≥1 contribution in the last year */
  activeDays?: number
  /** Share of contributions that fell on Sat/Sun (0–1) */
  weekendShare?: number
}

const LANGUAGE_CATEGORIES: Record<string, { languages: string[]; icon: string }> = {
  'Full-Stack': {
    languages: ['TypeScript', 'JavaScript', 'Python', 'Ruby', 'PHP'],
    icon: 'fas fa-layer-group',
  },
  Systems: {
    languages: ['Rust', 'Go', 'C', 'C++'],
    icon: 'fas fa-microchip',
  },
  Mobile: {
    languages: ['Swift', 'Kotlin', 'Dart'],
    icon: 'fas fa-mobile-screen',
  },
  'Data Science': {
    languages: ['R', 'Julia'],
    icon: 'fas fa-chart-line',
  },
  DevOps: {
    languages: ['Shell', 'Dockerfile', 'HCL'],
    icon: 'fas fa-server',
  },
}

const LANGUAGE_SPECIALIST: Record<string, { label: string; icon: string }> = {
  TypeScript: { label: 'TypeScript', icon: 'fab fa-js' },
  JavaScript: { label: 'JavaScript', icon: 'fab fa-js' },
  Python: { label: 'Pythonista', icon: 'fab fa-python' },
  Go: { label: 'Gopher', icon: 'fab fa-golang' },
  Rust: { label: 'Rustacean', icon: 'fas fa-gears' },
  Java: { label: 'Java Dev', icon: 'fab fa-java' },
  'C#': { label: 'C# Dev', icon: 'fas fa-hashtag' },
  PHP: { label: 'PHP Dev', icon: 'fab fa-php' },
  Ruby: { label: 'Rubyist', icon: 'fas fa-gem' },
  Swift: { label: 'Swift Dev', icon: 'fab fa-swift' },
  Kotlin: { label: 'Kotlin Dev', icon: 'fas fa-mobile-screen-button' },
  Dart: { label: 'Flutter Dev', icon: 'fas fa-mobile' },
  Vue: { label: 'Vue Dev', icon: 'fab fa-vuejs' },
  HTML: { label: 'Front-End', icon: 'fas fa-paintbrush' },
  CSS: { label: 'Front-End', icon: 'fas fa-paintbrush' },
}

const MAX_TAGS = 6

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

/** Profile tags with icons — checkmygit rules + extended activity/stack badges. */
export function generateProfileTags(input: ProfileTagInput): ProfileTag[] {
  const tags: ProfileTag[] = []

  // Stars
  if (input.totalStars > 5000) {
    pushUnique(tags, { label: 'Star Magnet', icon: 'fas fa-sun' })
  } else if (input.totalStars > 1000) {
    pushUnique(tags, { label: 'Popular Creator', icon: 'fas fa-fire' })
  } else if (input.totalStars > 100) {
    pushUnique(tags, { label: 'Rising Star', icon: 'fas fa-star' })
  }

  // Repos
  if (input.totalRepos > 100) {
    pushUnique(tags, { label: 'Repo Factory', icon: 'fas fa-warehouse' })
  } else if (input.totalRepos > 50) {
    pushUnique(tags, { label: 'Prolific', icon: 'fas fa-code' })
  } else if (input.totalRepos > 20) {
    pushUnique(tags, { label: 'Builder', icon: 'fas fa-hammer' })
  }

  // Forks received
  if ((input.totalForks || 0) > 200) {
    pushUnique(tags, { label: 'Forked Often', icon: 'fas fa-code-branch' })
  } else if ((input.totalForks || 0) > 50) {
    pushUnique(tags, { label: 'Reusable', icon: 'fas fa-recycle' })
  }

  // Followers
  if (input.followers > 1000) {
    pushUnique(tags, { label: 'Influencer', icon: 'fas fa-bullhorn' })
  } else if (input.followers > 100) {
    pushUnique(tags, { label: 'Community Member', icon: 'fas fa-user-group' })
  }

  // Following / network
  if ((input.following || 0) > 200) {
    pushUnique(tags, { label: 'Networker', icon: 'fas fa-share-nodes' })
  }

  // Language category + specialist
  if (input.topLanguage) {
    const cat = languageCategory(input.topLanguage)
    if (cat) pushUnique(tags, cat)
    const specialist = LANGUAGE_SPECIALIST[input.topLanguage]
    if (specialist) pushUnique(tags, specialist)
  }

  // Polyglot / focused stack
  if ((input.languageCount || 0) >= 6) {
    pushUnique(tags, { label: 'Polyglot', icon: 'fas fa-globe' })
  } else if ((input.languageCount || 0) >= 4) {
    pushUnique(tags, { label: 'Multi-Stack', icon: 'fas fa-cubes' })
  }

  // Yearly contributions
  if (input.totalContributions > 2000) {
    pushUnique(tags, { label: 'Contribution Beast', icon: 'fas fa-dragon' })
  } else if (input.totalContributions > 1000) {
    pushUnique(tags, { label: 'Highly Active', icon: 'fas fa-bolt' })
  } else if (input.totalContributions > 365) {
    pushUnique(tags, { label: 'Consistent', icon: 'fas fa-calendar-check' })
  } else if (input.totalContributions > 100) {
    pushUnique(tags, { label: 'Getting Started', icon: 'fas fa-seedling' })
  }

  // Commits
  if ((input.totalCommits || 0) > 2000) {
    pushUnique(tags, { label: 'Commit Machine', icon: 'fas fa-terminal' })
  } else if ((input.totalCommits || 0) > 500) {
    pushUnique(tags, { label: 'Ship Often', icon: 'fas fa-rocket' })
  }

  // Streak
  if ((input.streakDays || 0) >= 30) {
    pushUnique(tags, { label: 'On Fire', icon: 'fas fa-fire-flame-curved' })
  } else if ((input.streakDays || 0) >= 7) {
    pushUnique(tags, { label: 'Week Streak', icon: 'fas fa-link' })
  }

  // Active day coverage in last year
  if ((input.activeDays || 0) >= 200) {
    pushUnique(tags, { label: 'Everyday Coder', icon: 'fas fa-calendar-day' })
  }

  // Weekend warrior
  if ((input.weekendShare || 0) >= 0.35 && input.totalContributions > 100) {
    pushUnique(tags, { label: 'Weekend Warrior', icon: 'fas fa-mug-hot' })
  }

  // Tenure
  if (input.yearsActive > 10) {
    pushUnique(tags, { label: 'OG', icon: 'fas fa-landmark' })
  } else if (input.yearsActive > 5) {
    pushUnique(tags, { label: 'Veteran', icon: 'fas fa-medal' })
  } else if (input.yearsActive > 0 && input.yearsActive < 1) {
    pushUnique(tags, { label: 'Newcomer', icon: 'fas fa-baby' })
  }

  return tags.slice(0, MAX_TAGS)
}

export function getYearsActiveFromCreatedAt(createdAt?: string | null): number {
  if (!createdAt) return 0
  const start = new Date(createdAt).getTime()
  if (Number.isNaN(start)) return 0
  return Math.max(0, (Date.now() - start) / (365.25 * 24 * 3600 * 1000))
}

/** Current streak: consecutive days with contributions ending at the latest heatmap day. */
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
      // allow streak to start from yesterday if today is still 0
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
