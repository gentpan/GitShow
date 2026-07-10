import { useMemo } from 'react'
import { Card } from '@/components/home/ui/Card'
import { contributionColor, getMonthLabels, getTotalContributions, heatmapToWeeks } from '@/lib/homeUtils'
import { formatNumber } from '@/lib/utils'

interface ContributionGraphProps {
  heatmap: { date: string; count: number }[]
  accent: string
}

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

export function ContributionGraph({ heatmap, accent }: ContributionGraphProps) {
  const weeks = useMemo(() => heatmapToWeeks(heatmap), [heatmap])
  const monthLabels = useMemo(() => getMonthLabels(weeks), [weeks])
  const total = useMemo(() => getTotalContributions(heatmap), [heatmap])

  if (!heatmap?.length) {
    return (
      <Card padding="lg">
        <div className="text-sm text-[var(--home-text-secondary)] text-center py-8">
          Contribution data not available
        </div>
      </Card>
    )
  }

  return (
    <Card padding="lg" className="home-contrib-card">
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <h3 className="text-sm font-medium text-[var(--home-text-primary)]">Contributions</h3>
        <p className="text-sm text-[var(--home-text-secondary)]">
          <span className="font-semibold" style={{ color: accent }}>{formatNumber(total)}</span>
          {' '}in the last year
        </p>
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <div className="min-w-[680px]">
          <div className="flex text-[10px] text-[var(--home-text-tertiary)] mb-1 pl-7 relative h-4">
            {weeks.map((_, i) => (
              <div key={i} className="flex-1 relative min-w-0">
                {monthLabels.map((month) =>
                  month.col === i ? (
                    <span key={`${month.label}-${i}`} className="absolute left-0">{month.label}</span>
                  ) : null,
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-[3px]">
            <div className="flex flex-col gap-[3px] text-[10px] text-[var(--home-text-tertiary)] pr-1 shrink-0">
              {DAY_LABELS.map((label, i) => (
                <div key={i} className="h-[11px] leading-[11px]">{label}</div>
              ))}
            </div>

            <div className="flex gap-[3px] flex-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px] flex-1 min-w-0">
                  {week.days.map((day, di) => (
                    <div
                      key={di}
                      className="home-contrib-cell home-rounded-sm w-full aspect-square min-h-[11px]"
                      style={{ backgroundColor: contributionColor(day.count) }}
                      title={`${day.date}: ${day.count} contributions`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 text-xs text-[var(--home-text-tertiary)]">
        <span>Last 52 weeks of activity</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          {[0, 2, 5, 10, 15].map((level, i) => (
            <div
              key={i}
              className="home-contrib-cell home-rounded-sm w-3 h-3"
              style={{ backgroundColor: contributionColor(level) }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </Card>
  )
}
