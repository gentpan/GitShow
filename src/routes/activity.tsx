import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import { themeMap, timeAgo } from '@/lib/utils'

const eventTypes = [
  { type: 'all', label: '全部' },
  { type: 'PushEvent', label: 'Push' },
  { type: 'PullRequestEvent', label: 'PR' },
  { type: 'IssuesEvent', label: 'Issue' },
  { type: 'WatchEvent', label: 'Star' },
  { type: 'ReleaseEvent', label: 'Release' },
]

const typeStyles: Record<string, { bg: string; color: string }> = {
  PushEvent: { bg: 'rgba(74,222,128,0.15)', color: '#4ade80' },
  PullRequestEvent: { bg: 'rgba(147,197,253,0.15)', color: '#93c5fd' },
  IssuesEvent: { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
  WatchEvent: { bg: 'rgba(244,114,132,0.15)', color: '#f472b6' },
  ReleaseEvent: { bg: 'rgba(52,211,153,0.15)', color: '#34d399' },
}

export const Route = createFileRoute('/activity')({ component: ActivityPage })

function ActivityPage() {
  const [feed, setFeed] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [selectedType, setSelectedType] = useState('all')
  const [pending, setPending] = useState(true)

  useEffect(() => {
    Promise.all([api.getFeed(50).then(setFeed), api.getSettings().then(setSettings)]).finally(() => setPending(false))
  }, [])

  const c = (themeMap[(settings?.theme as keyof typeof themeMap) || 'green'] || themeMap.green).primary
  const filtered = useMemo(() => selectedType === 'all' ? feed : feed.filter((i) => i.type === selectedType), [feed, selectedType])

  if (pending) {
    return <div className="flex items-center justify-center py-20"><div className="loading-spinner w-8 h-8 border-2 animate-spin" style={{ borderColor: c, borderTopColor: 'transparent' }} /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold" style={{ color: '#fafafa' }}>看板</h1>
        <div className="flex flex-wrap gap-2">
          {eventTypes.map((t) => (
            <button key={t.type} type="button" className="px-3 py-1.5 text-xs font-medium" style={selectedType === t.type ? { backgroundColor: c, color: '#000' } : { backgroundColor: '#111', color: '#a1a1aa', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => setSelectedType(t.type)}>{t.label}</button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {filtered.map((item) => {
          const st = typeStyles[item.type] || { bg: 'rgba(161,161,170,0.15)', color: '#a1a1aa' }
          return (
            <div key={item.id} className="px-4 py-3 flex items-center gap-3 flex-wrap" style={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
              <img src={item.avatar_url} className="w-7 h-7 rounded-full" alt="" />
              <span className="text-xs px-1.5 py-0.5 font-medium" style={{ backgroundColor: st.bg, color: st.color }}>{item.type.replace('Event', '')}</span>
              <a href={item.actor_url} target="_blank" rel="noreferrer" className="text-sm hover:underline" style={{ color: c }}>{item.actor}</a>
              <span style={{ color: '#52525b' }}>{item.action}</span>
              <a href={item.repo_url} target="_blank" rel="noreferrer" className="text-sm hover:underline" style={{ color: c }}>{item.repo}</a>
              {item.message && <span className="text-sm truncate max-w-xs" style={{ color: '#a1a1aa' }}>{item.message}</span>}
              <span className="text-xs ml-auto" style={{ color: '#52525b' }}>{timeAgo(item.created_at)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
