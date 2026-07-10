import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import { ActivityChart, ActivityTimeline } from '@/components/Charts'
import { formatNumber, langColor, repoIcon, sortLangPct, themeMap, timeAgo } from '@/lib/utils'

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
      const ordered = selected.map((name: string) => allRepos.find((x) => x.name === name)).filter(Boolean)
      return ordered.slice(0, count)
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
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hero-social-link"
                    style={{ backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = `rgba(${rgb},0.5)`; e.currentTarget.style.color = c }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#a1a1aa' }}
                  >
                    <i className={link.icon} />
                  </a>
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
        <div className="p-6 overflow-x-auto scrollbar-hide" style={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex w-full gap-[2px] min-w-[280px]">
            {heatmapWeeks.map((week, wi) => (
              <div key={wi} className="flex flex-col flex-1 gap-[2px]">
                {week.map((day: any, di: number) => (
                  <div key={di} className="w-full" style={{ ...heatmapStyle(day?.count || 0), aspectRatio: '1' }} title={`${day?.date}: ${day?.count || 0} contributions`} />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: '#a1a1aa' }}>
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3" style={{ backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }} />
              <div className="w-3 h-3" style={{ backgroundColor: `rgba(${rgb}, 0.2)` }} />
              <div className="w-3 h-3" style={{ backgroundColor: `rgba(${rgb}, 0.45)` }} />
              <div className="w-3 h-3" style={{ backgroundColor: `rgba(${rgb}, 0.7)` }} />
              <div className="w-3 h-3" style={{ backgroundColor: c }} />
            </div>
            <span>More</span>
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
            <Link key={repo.id} to="/projects/$name" params={{ name: repo.name }} className="repo-card group block overflow-hidden">
              <div className="p-4 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium truncate flex items-center gap-2" style={{ color: c }}>
                    <i className={`${repoIcon(repo.language)} text-xs`} style={{ color: c }} />{repo.name}
                    {repo.latest_version && <span className="text-[10px] px-1 py-0.5 shrink-0" style={{ backgroundColor: c, color: '#111' }}>{repo.latest_version}</span>}
                  </h3>
                  <div className="flex items-center gap-3 text-xs shrink-0" style={{ color: '#a1a1aa' }}>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                      {repo.forks_count}
                    </span>
                  </div>
                </div>
                {repo.description && <p className="text-sm mt-1 line-clamp-2 h-10" style={{ color: '#a1a1aa' }}>{repo.description}</p>}
                <div className="text-xs mt-2" style={{ color: '#a1a1aa' }}>{timeAgo(repo.updated_at)}</div>
              </div>
              <div className="flex h-[8px] w-full mt-auto relative" style={{ minWidth: 0 }}>
                {sortLangPct(repo.lang_pct).map(([lang, pct], i) => (
                  <div
                    key={i}
                    className="h-full relative group/lang"
                    style={{ width: `${Math.max(pct, 1)}%`, backgroundColor: langColor(lang), zIndex: i + 1 }}
                  >
                    <div
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 text-[10px] whitespace-nowrap opacity-0 group-hover/lang:opacity-100 transition-opacity pointer-events-none"
                      style={{ backgroundColor: 'rgba(0,0,0,0.85)', color: '#fafafa', zIndex: 100 }}
                    >
                      {lang} {pct.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </Link>
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
