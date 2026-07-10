import { Card } from '@/components/home/ui/Card'
import { formatBytes } from '@/lib/homeUtils'
import type { LanguageStat } from '@/lib/homeUtils'

interface LanguageChartProps {
  languages: LanguageStat[]
}

export function LanguageChart({ languages }: LanguageChartProps) {
  const topLanguages = languages.slice(0, 5)
  const total = topLanguages.reduce((sum, lang) => sum + lang.size, 0)

  const size = 120
  const strokeWidth = 20
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  let cumulativeOffset = 0
  const segments = topLanguages.map((lang) => {
    const percentage = total ? (lang.size / total) * 100 : 0
    const segment = { lang, offset: cumulativeOffset, percentage }
    cumulativeOffset += percentage
    return segment
  })

  return (
    <Card padding="lg" className="h-full">
      {topLanguages.length > 0 ? (
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative shrink-0">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
              {segments.map((segment) => {
                const dash = (segment.percentage / 100) * circumference
                const gap = circumference - dash
                const offset = (segment.offset / 100) * circumference
                return (
                  <circle
                    key={segment.lang.name}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={segment.lang.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${dash} ${gap}`}
                    strokeDashoffset={-offset}
                  />
                )
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs text-[var(--home-text-secondary)]">
              {topLanguages.length} langs
            </div>
          </div>

          <div className="flex-1 w-full space-y-2">
            {topLanguages.map((lang) => (
              <div key={lang.name} className="flex items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 home-rounded-full shrink-0" style={{ backgroundColor: lang.color }} />
                  <span className="text-[var(--home-text-primary)] truncate">{lang.name}</span>
                </div>
                <span className="text-[var(--home-text-secondary)] tabular-nums shrink-0">{lang.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-sm text-[var(--home-text-secondary)] text-center py-6">No language data available</div>
      )}

      {topLanguages.length > 0 && (
        <p className="text-xs text-[var(--home-text-tertiary)] mt-4 text-center sm:text-left">
          Based on {formatBytes(total)} of code
        </p>
      )}
    </Card>
  )
}
