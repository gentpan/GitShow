import { timeAgo } from '@/lib/utils'

const typeMap: Record<string, { label: string; bg: string; color: string }> = {
  PushEvent: { label: 'push', bg: 'rgba(74,222,128,0.15)', color: '#4ade80' },
  CreateEvent: { label: 'create', bg: 'rgba(96,165,250,0.15)', color: '#60a5fa' },
  PullRequestEvent: { label: 'PR', bg: 'rgba(147,197,253,0.15)', color: '#93c5fd' },
  IssuesEvent: { label: 'issue', bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
  WatchEvent: { label: 'star', bg: 'rgba(244,114,132,0.15)', color: '#f472b6' },
  ForkEvent: { label: 'fork', bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
  ReleaseEvent: { label: 'release', bg: 'rgba(52,211,153,0.15)', color: '#34d399' },
}

function formatFullDate(dateStr?: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function ActivityTimeline({ items, color }: { items: any[]; color: string }) {
  return (
    <div className="activity-timeline">
      {items?.map((item) => {
        const t = typeMap[item.type] || { label: item.type, bg: 'rgba(161,161,170,0.15)', color: '#a1a1aa' }
        return (
          <div key={item.id} className="px-3 py-2 flex items-center gap-2 min-w-0" style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <img src={item.avatar_url} className="w-6 h-6 rounded-full shrink-0" alt="" />
            <span className="text-xs shrink-0 px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: t.bg, color: t.color }}>{t.label}</span>
            <a href={item.actor_url} target="_blank" rel="noreferrer" className="hover:underline text-sm shrink-0" style={{ color }}>{item.actor}</a>
            <span className="text-sm shrink-0" style={{ color: '#52525b' }}>/</span>
            <a href={item.repo_url} target="_blank" rel="noreferrer" className="hover:underline text-sm truncate min-w-0" style={{ color }}>{item.repo}</a>
            <span className="text-xs ml-auto shrink-0" style={{ color: '#52525b' }}>{timeAgo(item.created_at)}</span>
          </div>
        )
      })}
      {!items?.length && <div className="col-span-2 text-sm py-6 text-center" style={{ color: '#a1a1aa' }}>暂无近期动态</div>}
    </div>
  )
}

export function ActivityChart({ heatmap, rgb }: { heatmap: any[]; rgb: string }) {
  const chartData = heatmap?.length ? heatmap.slice(-30) : []
  const maxCount = chartData.length ? Math.max(...chartData.map((d) => d.count), 1) : 1

  const barStyle = (count: number) => ({
    height: `${Math.max(Math.round((count / maxCount) * 128), 4)}px`,
    backgroundColor: count > 0 ? `rgba(${rgb}, 0.7)` : '#1a1a1a',
    minHeight: '4px',
  })

  const formatDay = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex justify-end mb-3"><span className="text-xs" style={{ color: '#52525b' }}>最近 30 天</span></div>
      <div className="activity-chart-bars flex items-end gap-[6px] h-36 min-w-[280px]">
        {chartData.map((day, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group min-w-0">
            <div className="w-full relative transition-all duration-500" style={barStyle(day.count)}>
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap px-1.5 py-0.5" style={{ backgroundColor: 'var(--theme-primary)', color: '#000' }}>{day.count}</div>
            </div>
            <div className="chart-day-label text-[10px]" style={{ color: '#52525b' }}>{formatDay(day.date)}</div>
          </div>
        ))}
      </div>
      <div className="activity-chart-range">
        <span>{formatFullDate(chartData[0]?.date)}</span>
        <span>{formatFullDate(chartData[chartData.length - 1]?.date)}</span>
      </div>
    </div>
  )
}

export function StarsTrend({ history }: { history: any[]; color?: string }) {
  const displayData = history?.slice(-14) || []
  const minStars = displayData.length ? Math.min(...displayData.map((p) => p.stars)) : 0
  const maxStars = displayData.length ? Math.max(...displayData.map((p) => p.stars)) : 1
  const range = maxStars - minStars || 1

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium" style={{ color: '#a1a1aa' }}>Star 趋势</span>
        {displayData.length > 0 && <span className="text-xs" style={{ color: '#52525b' }}>{displayData[displayData.length - 1].stars} stars</span>}
      </div>
      {!displayData.length ? (
        <div className="text-xs py-4 text-center" style={{ color: '#52525b' }}>暂无历史数据</div>
      ) : (
        <div className="flex items-end gap-1 h-20 overflow-x-auto scrollbar-hide">
          {displayData.map((point, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-[12px]">
              <div className="w-full" style={{ height: `${Math.max(((point.stars - minStars) / range) * 64, 4)}px`, backgroundColor: `rgba(var(--theme-primary-rgb), 0.7)` }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
