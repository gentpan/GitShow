import { Card } from '@/components/home/ui/Card'
import { getYearsActive } from '@/lib/homeUtils'
import { formatNumber } from '@/lib/utils'

interface StatsGridProps {
  me: any
  heatmap: { count?: number; date?: string }[]
  accent: string
}

export function StatsGrid({ me, heatmap, accent }: StatsGridProps) {
  const stats = me?.stats
  const yearsActive = getYearsActive(heatmap)

  const items = [
    {
      label: 'Total Repos',
      value: stats?.total_repos ?? 0,
      icon: 'fas fa-folder',
    },
    {
      label: 'Total Stars',
      value: stats?.total_stars ?? 0,
      icon: 'fas fa-star',
      accent: true,
    },
    {
      label: 'Followers',
      value: me?.user?.followers ?? 0,
      icon: 'fas fa-users',
    },
    {
      label: 'Years Active',
      value: yearsActive,
      icon: 'fas fa-calendar',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.label} padding="md" className="home-stat-card">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div
                className="text-2xl font-bold tabular-nums"
                style={{ color: item.accent ? accent : 'var(--home-text-primary)' }}
              >
                {formatNumber(item.value)}
              </div>
              <div className="text-xs text-[var(--home-text-secondary)] mt-1">{item.label}</div>
            </div>
            <i className={`${item.icon} text-sm mt-1`} style={{ color: accent }} />
          </div>
        </Card>
      ))}
    </div>
  )
}
