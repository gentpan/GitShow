import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import { themeMap, timeAgo } from '@/lib/utils'

export const Route = createFileRoute('/following')({ component: FollowingPage })

function FollowingPage() {
  const [following, setFollowing] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [pending, setPending] = useState(true)

  useEffect(() => {
    Promise.all([api.getFollowing().then(setFollowing), api.getSettings().then(setSettings)]).finally(() => setPending(false))
  }, [])

  const c = (themeMap[(settings?.theme as keyof typeof themeMap) || 'green'] || themeMap.green).primary
  const sorted = useMemo(() => [...following].sort((a, b) => +new Date(b.last_active || 0) - +new Date(a.last_active || 0)), [following])

  if (pending) {
    return <div className="flex items-center justify-center py-20"><div className="loading-spinner w-8 h-8 border-2 animate-spin" style={{ borderColor: c, borderTopColor: 'transparent' }} /></div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: '#fafafa' }}>关注</h1>
      <div className="space-y-4">
        {sorted.map((user) => (
          <div key={user.username} className="p-5" style={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-3">
              <img src={user.avatar_url} className="w-10 h-10" alt="" />
              <div className="min-w-0 flex-1">
                <a href={`https://github.com/${user.username}`} target="_blank" rel="noreferrer" className="font-medium hover:underline" style={{ color: c }}>{user.username}</a>
                {user.bio && <p className="text-xs truncate" style={{ color: '#a1a1aa' }}>{user.bio}</p>}
              </div>
              {user.last_active && <span className="text-xs" style={{ color: '#52525b' }}>最近活跃: {timeAgo(user.last_active)}</span>}
            </div>
            {user.recent_repos?.length > 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {user.recent_repos.slice(0, 3).map((repo: any) => (
                  <a key={repo.id} href={repo.html_url} target="_blank" rel="noreferrer" className="p-3 text-sm" style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', color: c }}>{repo.name}</a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
