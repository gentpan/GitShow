import { useState } from 'react'
import { Card } from '@/components/home/ui/Card'
import { formatBytes } from '@/lib/homeUtils'
import type { LanguageStat } from '@/lib/homeUtils'

interface LanguageChartProps {
  languages: LanguageStat[]
}

export function LanguageChart({ languages }: LanguageChartProps) {
  const topLanguages = languages.slice(0, 5)
  const total = topLanguages.reduce((sum, lang) => sum + lang.size, 0)
  const [hovered, setHovered] = useState<string | null>(null)

  const size = 140
  const baseStroke = 18
  const activeStroke = 24
  const radius = (size - activeStroke) / 2
  const circumference = 2 * Math.PI * radius

  let cumulativeOffset = 0
  const segments = topLanguages.map((lang) => {
    const percentage = total ? (lang.size / total) * 100 : 0
    const segment = { lang, offset: cumulativeOffset, percentage }
    cumulativeOffset += percentage
    return segment
  })

  const activeSeg = hovered ? segments.find((s) => s.lang.name === hovered) : null

  return (
    <Card padding="lg" className="h-full">
      {topLanguages.length > 0 ? (
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div
            className="lang-donut relative shrink-0"
            style={{ width: size, height: size }}
            onMouseLeave={() => setHovered(null)}
          >
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={baseStroke}
              />
              {segments.map((segment) => {
                const dash = (segment.percentage / 100) * circumference
                const gap = circumference - dash
                const offset = (segment.offset / 100) * circumference
                const isActive = hovered === segment.lang.name
                const dimmed = hovered != null && !isActive
                return (
                  <circle
                    key={segment.lang.name}
                    className={`lang-donut-seg${isActive ? ' is-active' : ''}${dimmed ? ' is-dimmed' : ''}`}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={segment.lang.color}
                    strokeWidth={isActive ? activeStroke : baseStroke}
                    strokeDasharray={`${dash} ${gap}`}
                    strokeDashoffset={-offset}
                    strokeLinecap="butt"
                    style={{
                      filter: isActive ? `drop-shadow(0 0 8px ${segment.lang.color}99)` : undefined,
                    }}
                    onMouseEnter={() => setHovered(segment.lang.name)}
                  />
                )
              })}
            </svg>
            <div className="lang-donut-center absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              {activeSeg ? (
                <>
                  <span className="lang-donut-pct tabular-nums" style={{ color: activeSeg.lang.color }}>
                    {Math.round(activeSeg.percentage)}%
                  </span>
                  <span className="lang-donut-name truncate max-w-[72px]">{activeSeg.lang.name}</span>
                </>
              ) : (
                <>
                  <span className="lang-donut-pct tabular-nums" style={{ color: 'var(--home-text-primary)' }}>
                    {topLanguages.length}
                  </span>
                  <span className="lang-donut-name">langs</span>
                </>
              )}
            </div>
          </div>

          <div
            className="flex-1 w-full space-y-1"
            role="list"
            aria-label="语言占比"
            onMouseLeave={() => setHovered(null)}
          >
            {topLanguages.map((lang) => {
              const pct = total ? Math.round((lang.size / total) * 100) : lang.percentage
              const isActive = hovered === lang.name
              return (
                <div
                  key={lang.name}
                  role="listitem"
                  className={`lang-list-item${isActive ? ' is-active' : ''}`}
                  onMouseEnter={() => setHovered(lang.name)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="lang-list-dot shrink-0"
                      style={{ backgroundColor: lang.color }}
                    />
                    <span className="lang-list-name truncate">{lang.name}</span>
                  </div>
                  <span className="lang-list-pct tabular-nums shrink-0">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="text-sm text-[var(--home-text-secondary)] text-center py-6">
          暂无语言数据
        </div>
      )}

      {topLanguages.length > 0 && (
        <p className="text-xs text-[var(--home-text-tertiary)] mt-4 text-center sm:text-left">
          基于 {formatBytes(total)} 代码量 · Top 5
        </p>
      )}
    </Card>
  )
}
