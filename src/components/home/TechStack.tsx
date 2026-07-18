import { Card } from '@/components/home/ui/Card'
import type { FocusArea } from '@/lib/homeUtils'

interface TechStackProps {
  focusAreas: FocusArea[]
}

export function TechStack({ focusAreas }: TechStackProps) {
  return (
    <Card padding="lg" className="h-full">
      <div className="text-xs font-medium text-[var(--home-text-tertiary)] mb-3 uppercase tracking-wide">
        技术方向
      </div>

      {focusAreas.length > 0 ? (
        <div className="space-y-3">
          {focusAreas.map((area) => (
            <div key={area.label} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2 min-w-0 text-[var(--home-text-primary)]">
                  <i className={`${area.icon} text-xs text-[var(--home-text-tertiary)] w-4 text-center`} />
                  <span className="truncate">{area.label}</span>
                </div>
                <span className="tabular-nums text-[var(--home-text-secondary)] shrink-0">
                  {area.percentage}%
                </span>
              </div>
              <div className="tech-focus-track">
                <div
                  className="tech-focus-fill"
                  style={{ width: `${Math.max(area.percentage, 4)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <span className="text-sm text-[var(--home-text-secondary)]">暂无足够的语言数据</span>
      )}
    </Card>
  )
}
