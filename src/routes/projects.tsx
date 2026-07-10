import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import { langColor, repoIcon, sortLangPct, themeMap, timeAgo } from '@/lib/utils'

export const Route = createFileRoute('/projects')({ component: ProjectsPage })

function ProjectsPage() {
  const [repos, setRepos] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [pending, setPending] = useState(true)

  useEffect(() => {
    Promise.all([api.getRepos().then(setRepos), api.getSettings().then(setSettings)]).finally(() => setPending(false))
  }, [])

  const theme = themeMap[(settings?.theme as keyof typeof themeMap) || 'green'] || themeMap.green
  const c = theme.primary

  const filteredRepos = useMemo(() => {
    const selected: string[] = settings?.homepage_repos || []
    if (!selected.length) return []
    return selected
      .map((name) => repos.find((r) => r.name === name || r.full_name === name))
      .filter(Boolean)
  }, [repos, settings])

  if (pending) {
    return <div className="flex items-center justify-center py-20"><div className="loading-spinner w-8 h-8 border-2 animate-spin" style={{ borderColor: c, borderTopColor: 'transparent' }} /></div>
  }

  if (!filteredRepos.length) {
    return <div className="text-center py-20" style={{ color: '#a1a1aa' }}>后台未开启任何项目</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold" style={{ color: '#fafafa' }}>所有项目</h1>
        <span className="text-sm" style={{ color: '#a1a1aa' }}>{filteredRepos.length} 个仓库</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRepos.map((repo: any) => (
          <a key={repo.id} href={repo.html_url} target="_blank" rel="noreferrer" className="repo-card group block overflow-hidden">
            <div className="p-4 pb-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium truncate flex items-center gap-2 min-w-0" style={{ color: c }}>
                  <i className={`${repoIcon(repo.language)} text-xs shrink-0`} style={{ color: c }} />{repo.name}
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
          </a>
        ))}
      </div>
    </div>
  )
}
