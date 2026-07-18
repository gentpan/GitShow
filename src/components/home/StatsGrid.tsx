import { Card } from '@/components/home/ui/Card'
import { getYearsActiveFromCreatedAt } from '@/lib/profileTags'
import { formatNumber } from '@/lib/utils'

interface StatsGridProps {
  me: any
  heatmap: { count?: number; date?: string }[]
  accent: string
}

export function StatsGrid({ me, accent }: StatsGridProps) {
  const stats = me?.stats
  const yearsActive = Math.max(1, Math.floor(getYearsActiveFromCreatedAt(me?.user?.created_at) || 1))

  const items = [
    {
      label: '公开仓库',
      value: stats?.total_repos ?? 0,
      icon: 'fas fa-folder',
    },
    {
      label: '获得 Star',
      value: stats?.total_stars ?? 0,
      icon: 'fas fa-star',
      accent: true,
    },
    {
      label: '关注者',
      value: me?.user?.followers ?? 0,
      icon: 'fas fa-users',
    },
    {
      label: '活跃年限',
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
