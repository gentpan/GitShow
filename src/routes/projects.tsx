import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import { repoIcon, sortLangPct, themeMap, timeAgo } from '@/lib/utils'

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
    return selected.map((name) => repos.find((r) => r.name === name)).filter(Boolean)
  }, [repos, settings])

  if (pending) {
    return <div className="flex items-center justify-center py-20"><div className="loading-spinner w-8 h-8 border-2 animate-spin" style={{ borderColor: c, borderTopColor: 'transparent' }} /></div>
  }

  if (!filteredRepos.length) {
    return <div className="text-center py-20 text-sm" style={{ color: '#a1a1aa' }}>暂无已启用的项目，请在管理后台勾选要展示的仓库。</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: '#fafafa' }}>项目</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRepos.map((repo: any) => (
          <a key={repo.id} href={repo.html_url} target="_blank" rel="noreferrer" className="repo-card block overflow-hidden">
            <div className="p-4 pb-3">
              <h3 className="font-medium flex items-center gap-2" style={{ color: c }}>
                <i className={`${repoIcon(repo.language)} text-xs`} />{repo.name}
                {repo.latest_version && <span className="text-[10px] px-1 py-0.5" style={{ backgroundColor: c, color: '#111' }}>{repo.latest_version}</span>}
              </h3>
              {repo.description && <p className="text-sm mt-1 line-clamp-2" style={{ color: '#a1a1aa' }}>{repo.description}</p>}
              <div className="text-xs mt-2" style={{ color: '#a1a1aa' }}>{timeAgo(repo.updated_at)} · ★ {repo.stargazers_count}</div>
            </div>
            <div className="flex h-[8px] w-full">
              {sortLangPct(repo.lang_pct).map(([lang, pct], i) => (
                <div key={i} className="h-full" style={{ width: `${Math.max(pct, 1)}%`, backgroundColor: '#444' }} title={lang} />
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
