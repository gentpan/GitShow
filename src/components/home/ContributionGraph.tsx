import { useMemo } from 'react'
import { Card } from '@/components/home/ui/Card'
import { contributionColor, getMonthLabels, getTotalContributions, heatmapToWeeks } from '@/lib/homeUtils'
import { formatNumber } from '@/lib/utils'

interface ContributionGraphProps {
  heatmap: { date: string; count: number }[]
}

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']
const GITHUB_GREEN_ACCENT = '#3fb950'

export function ContributionGraph({ heatmap }: ContributionGraphProps) {
  const weeks = useMemo(() => heatmapToWeeks(heatmap), [heatmap])
  const monthLabels = useMemo(() => getMonthLabels(weeks), [weeks])
  const total = useMemo(() => getTotalContributions(heatmap), [heatmap])

  if (!heatmap?.length) {
    return (
      <Card padding="lg">
        <div className="text-sm text-[var(--home-text-secondary)] text-center py-8">
          暂无贡献数据
        </div>
      </Card>
    )
  }

  return (
    <Card padding="lg" className="home-contrib-card">
      <p className="text-sm text-[var(--home-text-secondary)] mb-4">
        近一年{' '}
        <span className="font-semibold" style={{ color: GITHUB_GREEN_ACCENT }}>
          {formatNumber(total)}
        </span>{' '}
        次贡献
      </p>

      <div className="overflow-x-auto scrollbar-hide">
        <div className="min-w-[680px]">
          <div className="flex text-[10px] text-[var(--home-text-tertiary)] mb-1 pl-7 relative h-4">
            {weeks.map((_, i) => (
              <div key={i} className="flex-1 relative min-w-0">
                {monthLabels.map((month) =>
                  month.col === i ? (
                    <span key={`${month.label}-${i}`} className="absolute left-0">
                      {month.label}
                    </span>
                  ) : null,
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-[3px]">
            <div className="flex flex-col gap-[3px] text-[10px] text-[var(--home-text-tertiary)] pr-1 shrink-0">
              {DAY_LABELS.map((label, i) => (
                <div key={i} className="h-[11px] leading-[11px]">
                  {label}
                </div>
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
                      role="img"
                      aria-label={`${day.date}: ${day.count} contributions`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 text-xs text-[var(--home-text-tertiary)]">
        <span>近 52 周活跃度</span>
        <div className="flex items-center gap-1.5">
          <span>少</span>
          {[0, 2, 5, 10, 15].map((level) => (
            <div
              key={level}
              className="home-contrib-cell home-rounded-sm w-3 h-3"
              style={{ backgroundColor: contributionColor(level) }}
            />
          ))}
          <span>多</span>
        </div>
      </div>
    </Card>
  )
}
