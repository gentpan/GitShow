import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import { langColor, themeMap, timeAgo } from '@/lib/utils'

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
    return (
      <div className="flex items-center justify-center py-20">
        <div className="loading-spinner w-8 h-8 border-2 animate-spin" style={{ borderColor: c, borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!sorted.length) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold" style={{ color: '#fafafa' }}>关注的人</h1>
        <div className="text-center py-20" style={{ color: '#a1a1aa' }}>暂无关注数据</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: '#fafafa' }}>关注的人</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((user) => (
          <div
            key={user.username}
            className="p-5 transition-colors"
            style={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center gap-3">
              <img src={user.avatar_url} className="w-12 h-12" alt="" />
              <div className="min-w-0">
                <a href={`https://github.com/${user.username}`} target="_blank" rel="noreferrer" className="font-semibold truncate block hover:underline transition-colors" style={{ color: '#fafafa' }}>{user.username}</a>
                {user.bio && <p className="text-xs truncate" style={{ color: '#a1a1aa' }}>{user.bio}</p>}
              </div>
            </div>

            <div className="mt-3 text-xs" style={{ color: '#a1a1aa' }}>
              {user.last_active ? `最近活跃: ${timeAgo(user.last_active)}` : '近期无活动'}
            </div>

            {user.recent_repos?.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-medium mb-2" style={{ color: '#a1a1aa' }}>最近仓库</div>
                <div className="space-y-1.5">
                  {user.recent_repos.slice(0, 3).map((repo: any) => (
                    <a
                      key={repo.id}
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between text-sm px-3 py-1.5 transition-colors"
                      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.6)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.4)' }}
                    >
                      <span className="truncate" style={{ color: '#fafafa' }}>{repo.name}</span>
                      <div className="flex items-center gap-2 text-xs shrink-0 ml-2" style={{ color: '#a1a1aa' }}>
                        {repo.language && (
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5" style={{ backgroundColor: langColor(repo.language) }} />
                            {repo.language}
                          </span>
                        )}
                        <span className="flex items-center gap-0.5">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          {repo.stargazers_count}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {user.recent_events?.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-medium mb-2" style={{ color: '#a1a1aa' }}>最近提交</div>
                <div className="space-y-2">
                  {user.recent_events.slice(0, 2).map((evt: any) => (
                    <div key={evt.id} className="text-xs">
                      <div className="truncate" style={{ color: '#fafafa' }}>{evt.message || `pushed to ${evt.repo}`}</div>
                      <div className="mt-0.5" style={{ color: '#a1a1aa' }}>{evt.repo} · {timeAgo(evt.created_at)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
