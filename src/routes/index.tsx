import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import { ActivityChart, ActivityTimeline } from '@/components/Charts'
import { formatNumber, repoIcon, sortLangPct, themeMap, timeAgo } from '@/lib/utils'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const [me, setMe] = useState<any>(null)
  const [allRepos, setAllRepos] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])
  const [heatmap, setHeatmap] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [pending, setPending] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getMe().then(setMe),
      api.getRepos().then(setAllRepos),
      api.getActivity(undefined, 10).then(setActivity),
      api.getHeatmap().then(setHeatmap),
      api.getSettings().then(setSettings),
    ]).finally(() => setPending(false))
  }, [])

  const theme = themeMap[(settings?.theme as keyof typeof themeMap) || 'green'] || themeMap.green
  const c = theme.primary
  const rgb = theme.rgb

  const repos = useMemo(() => {
    const count = settings?.homepage_repo_count || 6
    const selected: string[] = settings?.homepage_repos || []
    if (selected.length) {
      return selected.map((name: string) => allRepos.find((x) => x.name === name)).filter(Boolean).slice(0, count)
    }
    return [...allRepos].sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at)).slice(0, count)
  }, [allRepos, settings])

  const heatmapWeeks = useMemo(() => {
    const weeks = []
    for (let i = 0; i < (heatmap?.length || 0); i += 7) weeks.push(heatmap.slice(i, i + 7))
    return weeks
  }, [heatmap])

  const heatmapStyle = (count: number) => {
    if (!count) return { backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }
    if (count <= 2) return { backgroundColor: `rgba(${rgb}, 0.2)` }
    if (count <= 5) return { backgroundColor: `rgba(${rgb}, 0.45)` }
    if (count <= 10) return { backgroundColor: `rgba(${rgb}, 0.7)` }
    return { backgroundColor: c }
  }

  if (pending) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="loading-spinner w-8 h-8 border-2 animate-spin" style={{ borderColor: c, borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="hero-card">
        <div className="hero-grid">
          <div className="hero-avatar-wrap"><img src={me?.user?.avatar_url} className="hero-avatar avatar-glow" alt="" /></div>
          <div className="hero-profile">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="hero-name">{me?.user?.login}</h1>
              {me?.location && <span className="flex items-center gap-1 text-sm" style={{ color: '#a1a1aa' }}><i className="fas fa-location-dot text-xs" />{me.location}</span>}
            </div>
            {me?.user?.bio && <p className="hero-bio">{me.user.bio}</p>}
            {settings?.social_links?.length > 0 && (
              <div className="hero-socials">
                {settings.social_links.map((link: any, i: number) => (
                  <a key={i} href={link.url} target="_blank" rel="noreferrer" className="hero-social-link" style={{ backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa' }}><i className={link.icon} /></a>
                ))}
              </div>
            )}
          </div>
          <div className="hero-stats-panel">
            {[
              ['fas fa-folder', formatNumber(me?.stats?.total_repos || 0), 'Repositories', false],
              ['fas fa-star', formatNumber(me?.stats?.total_stars || 0), 'Stars', true],
              ['fas fa-code-commit', formatNumber(me?.stats?.total_commits || 0), 'Commits', true],
              ['fas fa-user-plus', formatNumber(me?.following_count || 0), 'Following', false],
              ['fas fa-users', formatNumber(me?.user?.followers || 0), 'Followers', false],
            ].map(([icon, value, label, accent]) => (
              <div key={label as string} className="hero-stat-item">
                <i className={`${icon} hero-stat-icon`} style={{ color: c }} />
                <div className="hero-stat-copy">
                  <div className="hero-stat-value" style={accent ? { color: c } : undefined}>{value as string}</div>
                  <div className="hero-stat-label">{label as string}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium mb-3" style={{ color: '#a1a1aa' }}>贡献热力图</h2>
        <div className="p-6" style={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex w-full gap-[2px]">
            {heatmapWeeks.map((week, wi) => (
              <div key={wi} className="flex flex-col flex-1 gap-[2px]">
                {week.map((day: any, di: number) => (
                  <div key={di} className="w-full" style={{ ...heatmapStyle(day?.count || 0), aspectRatio: '1' }} title={`${day?.date}: ${day?.count || 0} contributions`} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium mb-3" style={{ color: '#a1a1aa' }}>每日活动</h2>
        <div className="p-6" style={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
          <ActivityChart heatmap={heatmap} rgb={rgb} />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium mb-3" style={{ color: '#a1a1aa' }}>项目</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repos.map((repo: any) => (
            <a key={repo.id} href={repo.html_url} target="_blank" rel="noreferrer" className="repo-card group block overflow-hidden">
              <div className="p-4 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium truncate flex items-center gap-2" style={{ color: c }}>
                    <i className={`${repoIcon(repo.language)} text-xs`} style={{ color: c }} />{repo.name}
                    {repo.latest_version && <span className="text-[10px] px-1 py-0.5 shrink-0" style={{ backgroundColor: c, color: '#111' }}>{repo.latest_version}</span>}
                  </h3>
                  <div className="text-xs shrink-0" style={{ color: '#a1a1aa' }}>★ {repo.stargazers_count}</div>
                </div>
                {repo.description && <p className="text-sm mt-1 line-clamp-2 h-10" style={{ color: '#a1a1aa' }}>{repo.description}</p>}
                <div className="text-xs mt-2" style={{ color: '#a1a1aa' }}>{timeAgo(repo.updated_at)}</div>
              </div>
              <div className="flex h-[8px] w-full mt-auto">
                {sortLangPct(repo.lang_pct).map(([lang, pct], i) => (
                  <div key={i} className="h-full" style={{ width: `${Math.max(pct, 1)}%`, backgroundColor: lang === repo.language ? c : '#333' }} />
                ))}
              </div>
            </a>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium mb-3" style={{ color: '#a1a1aa' }}>最近动态</h2>
        <div className="p-6" style={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
          <ActivityTimeline items={activity} color={c} />
        </div>
      </div>
    </div>
  )
}
