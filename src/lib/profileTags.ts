export interface ProfileTag {
  label: string
  icon: string
}

export interface ProfileTagInput {
  totalStars: number
  totalRepos: number
  followers: number
  totalContributions: number
  yearsActive: number
  topLanguage?: string | null
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

const TAG_META: Record<string, string> = {
  'Popular Creator': 'fas fa-fire',
  'Rising Star': 'fas fa-star',
  Prolific: 'fas fa-code',
  Influencer: 'fas fa-bullhorn',
  'Community Member': 'fas fa-user-group',
  'Highly Active': 'fas fa-bolt',
  Consistent: 'fas fa-calendar-check',
  Veteran: 'fas fa-medal',
}

function languageCategory(language: string): ProfileTag | null {
  for (const [label, meta] of Object.entries(LANGUAGE_CATEGORIES)) {
    if (meta.languages.includes(language)) {
      return { label, icon: meta.icon }
    }
  }
  return null
}

/** checkmygit-style profile tags (max 4), each with an FA icon. */
export function generateProfileTags(input: ProfileTagInput): ProfileTag[] {
  const tags: ProfileTag[] = []

  if (input.totalStars > 1000) {
    tags.push({ label: 'Popular Creator', icon: TAG_META['Popular Creator'] })
  } else if (input.totalStars > 100) {
    tags.push({ label: 'Rising Star', icon: TAG_META['Rising Star'] })
  }

  if (input.totalRepos > 50) {
    tags.push({ label: 'Prolific', icon: TAG_META.Prolific })
  }

  if (input.followers > 1000) {
    tags.push({ label: 'Influencer', icon: TAG_META.Influencer })
  } else if (input.followers > 100) {
    tags.push({ label: 'Community Member', icon: TAG_META['Community Member'] })
  }

  if (input.topLanguage) {
    const cat = languageCategory(input.topLanguage)
    if (cat) tags.push(cat)
  }

  if (input.totalContributions > 1000) {
    tags.push({ label: 'Highly Active', icon: TAG_META['Highly Active'] })
  } else if (input.totalContributions > 365) {
    tags.push({ label: 'Consistent', icon: TAG_META.Consistent })
  }

  if (input.yearsActive > 5) {
    tags.push({ label: 'Veteran', icon: TAG_META.Veteran })
  }

  return tags.slice(0, 4)
}

export function getYearsActiveFromCreatedAt(createdAt?: string | null): number {
  if (!createdAt) return 0
  const start = new Date(createdAt).getTime()
  if (Number.isNaN(start)) return 0
  return Math.max(0, Math.floor((Date.now() - start) / (365.25 * 24 * 3600 * 1000)))
}
