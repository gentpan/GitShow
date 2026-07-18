const langColors: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#2b7489',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#dea584',
  Vue: '#41b883',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Java: '#b07219',
  'C++': '#f34b7d',
  PHP: '#4F5D95',
}

const langIcons: Record<string, string> = {
  PHP: 'fab fa-php',
  JavaScript: 'fab fa-js',
  TypeScript: 'fab fa-js',
  Go: 'fab fa-golang',
  Vue: 'fab fa-vuejs',
  Python: 'fab fa-python',
  HTML: 'fab fa-html5',
  CSS: 'fab fa-css3',
  Shell: 'fas fa-terminal',
  Dockerfile: 'fab fa-docker',
}

export function langColor(lang?: string | null) {
  return langColors[lang || ''] || '#8b949e'
}

export function repoIcon(lang?: string | null) {
  return langIcons[lang || ''] || 'fas fa-code'
}

export function formatNumber(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export function timeAgo(date?: string | Date | null, locale: 'zh' | 'en' = 'zh') {
  if (!date) return ''
  const seconds = Math.floor((Date.now() - +new Date(date)) / 1000)
  const intervals: [number, string, string][] = [
    [31536000, '年前', 'y ago'],
    [2592000, '个月前', 'mo ago'],
    [86400, '天前', 'd ago'],
    [3600, '小时前', 'h ago'],
    [60, '分钟前', 'm ago'],
    [1, '秒前', 's ago'],
  ]
  for (const [secs, zh, en] of intervals) {
    const count = Math.floor(seconds / secs)
    if (count >= 1) return locale === 'zh' ? `${count}${zh}` : `${count}${en}`
  }
  return locale === 'zh' ? '刚刚' : 'just now'
}

export function sortLangPct(langPct?: Record<string, number> | null): [string, number][] {
  if (!langPct) return []
  return Object.entries(langPct).sort((a, b) => b[1] - a[1])
}

export const themeMap = {
  green: { primary: '#238636', rgb: '35, 134, 54' },
} as const

export function darkenColor(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, (n >> 16) - 24)
  const g = Math.max(0, ((n >> 8) & 0xff) - 24)
  const b = Math.max(0, (n & 0xff) - 24)
  return `rgb(${r}, ${g}, ${b})`
}
