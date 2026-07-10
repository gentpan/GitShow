import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { formatNumber, langColor, repoIcon, sortLangPct, themeMap, timeAgo } from '@/lib/utils'

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes} B`
}

export function RepoDetailPage({ name }: { name: string }) {
  const [data, setData] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [contents, setContents] = useState<any[]>([])
  const [currentPath, setCurrentPath] = useState('')
  const [pending, setPending] = useState(true)
  const [dirPending, setDirPending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setPending(true)
    setError('')
    Promise.all([api.getRepoDetail(name), api.getSettings()])
      .then(([detail, st]) => {
        setData(detail)
        setSettings(st)
        setContents(detail.contents || [])
        setCurrentPath('')
      })
      .catch(() => setError('仓库不存在或加载失败'))
      .finally(() => setPending(false))
  }, [name])

  const theme = themeMap[(settings?.theme as keyof typeof themeMap) || 'green'] || themeMap.green
  const c = theme.primary
  const repo = data?.repo

  async function openDir(path: string) {
    setDirPending(true)
    try {
      const items = await api.getRepoContents(name, path)
      setContents(items)
      setCurrentPath(path)
    } catch {
      setError('目录加载失败')
    } finally {
      setDirPending(false)
    }
  }

  function breadcrumbParts() {
    if (!currentPath) return []
    return currentPath.split('/')
  }

  if (pending) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="loading-spinner w-8 h-8 border-2 animate-spin" style={{ borderColor: c, borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (error || !repo) {
    return (
      <div className="text-center py-20 space-y-4">
        <p style={{ color: '#a1a1aa' }}>{error || '仓库不存在'}</p>
        <Link to="/projects" className="text-sm" style={{ color: c }}>返回项目列表</Link>
      </div>
    )
  }

  const crumbs = breadcrumbParts()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <Link to="/projects" className="text-xs mb-2 inline-block" style={{ color: '#71717a' }}>← 所有项目</Link>
          <h1 className="text-2xl font-bold flex items-center gap-2 flex-wrap" style={{ color: '#fafafa' }}>
            <i className={`${repoIcon(repo.language)} text-base`} style={{ color: c }} />
            {repo.full_name || repo.name}
            {repo.latest_version && (
              <span className="text-xs px-2 py-0.5 font-medium" style={{ backgroundColor: c, color: '#111' }}>{repo.latest_version}</span>
            )}
          </h1>
          {repo.description && <p className="text-sm mt-2 max-w-3xl" style={{ color: '#a1a1aa' }}>{repo.description}</p>}
        </div>
        <a href={repo.html_url} target="_blank" rel="noreferrer" className="contact-btn nav-pill px-4 py-2 text-sm font-medium shrink-0">
          <i className="fab fa-github mr-1.5" />在 GitHub 查看
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          ['Stars', repo.stargazers_count],
          ['Forks', repo.forks_count],
          ['Issues', repo.open_issues_count || 0],
          ['Watchers', repo.watchers_count || 0],
        ].map(([label, value]) => (
          <div key={label as string} className="stat-card">
            <div className="text-xl font-bold" style={{ color: c }}>{formatNumber(value as number)}</div>
            <div className="text-xs mt-1" style={{ color: '#a1a1aa' }}>{label as string}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6 min-w-0">
          {data.readme_html && (
            <div className="repo-panel">
              <h2 className="repo-panel-title">README</h2>
              <div className="repo-readme" dangerouslySetInnerHTML={{ __html: data.readme_html }} />
            </div>
          )}

          <div className="repo-panel">
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
              <h2 className="repo-panel-title mb-0">目录</h2>
              {currentPath && (
                <button type="button" className="text-xs" style={{ color: c }} onClick={() => openDir('')} disabled={dirPending}>
                  根目录
                </button>
              )}
            </div>
            {crumbs.length > 0 && (
              <div className="repo-breadcrumb text-xs mb-3 flex flex-wrap items-center gap-1" style={{ color: '#71717a' }}>
                <button type="button" onClick={() => openDir('')} style={{ color: c }}>~</button>
                {crumbs.map((part, i) => {
                  const path = crumbs.slice(0, i + 1).join('/')
                  const isLast = i === crumbs.length - 1
                  return (
                    <span key={path} className="flex items-center gap-1">
                      <span>/</span>
                      {isLast ? (
                        <span style={{ color: '#a1a1aa' }}>{part}</span>
                      ) : (
                        <button type="button" onClick={() => openDir(path)} style={{ color: c }}>{part}</button>
                      )}
                    </span>
                  )
                })}
              </div>
            )}
            <div className={`repo-file-list ${dirPending ? 'opacity-50' : ''}`}>
              {contents.map((item: any) => (
                item.type === 'dir' ? (
                  <button key={item.path} type="button" className="repo-file-row" onClick={() => openDir(item.path)}>
                    <i className="fas fa-folder text-yellow-500/80 w-4" />
                    <span className="truncate">{item.name}</span>
                  </button>
                ) : (
                  <a key={item.path} href={item.html_url} target="_blank" rel="noreferrer" className="repo-file-row">
                    <i className="fas fa-file text-xs w-4" style={{ color: '#71717a' }} />
                    <span className="truncate flex-1">{item.name}</span>
                    <span className="text-xs shrink-0" style={{ color: '#52525b' }}>{formatSize(item.size)}</span>
                  </a>
                )
              ))}
              {!contents.length && <div className="text-sm py-6 text-center" style={{ color: '#71717a' }}>空目录</div>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="repo-panel">
            <h2 className="repo-panel-title">信息</h2>
            <dl className="repo-meta text-sm space-y-2">
              {repo.language && <div><dt>语言</dt><dd>{repo.language}</dd></div>}
              {repo.default_branch && <div><dt>默认分支</dt><dd>{repo.default_branch}</dd></div>}
              {repo.license && <div><dt>License</dt><dd>{repo.license.spdx_id}</dd></div>}
              {repo.created_at && <div><dt>创建</dt><dd>{timeAgo(repo.created_at)}</dd></div>}
              {repo.pushed_at && <div><dt>最近推送</dt><dd>{timeAgo(repo.pushed_at)}</dd></div>}
              {repo.homepage && (
                <div><dt>主页</dt><dd><a href={repo.homepage} target="_blank" rel="noreferrer" className="truncate block" style={{ color: c }}>{repo.homepage.replace(/^https?:\/\//, '')}</a></dd></div>
              )}
            </dl>
            {repo.topics?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {repo.topics.map((t: string) => (
                  <span key={t} className="tag-green">{t}</span>
                ))}
              </div>
            )}
          </div>

          {sortLangPct(repo.lang_pct).length > 0 && (
            <div className="repo-panel">
              <h2 className="repo-panel-title">语言分布</h2>
              <div className="flex h-2 w-full overflow-hidden mb-3">
                {sortLangPct(repo.lang_pct).map(([lang, pct], i) => (
                  <div key={lang} style={{ width: `${Math.max(pct, 1)}%`, backgroundColor: langColor(lang), zIndex: i + 1 }} className="h-full" title={`${lang} ${pct.toFixed(1)}%`} />
                ))}
              </div>
              <div className="space-y-1">
                {sortLangPct(repo.lang_pct).slice(0, 6).map(([lang, pct]) => (
                  <div key={lang} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2" style={{ color: '#a1a1aa' }}>
                      <span className="w-2 h-2" style={{ backgroundColor: langColor(lang) }} />{lang}
                    </span>
                    <span style={{ color: '#71717a' }}>{pct.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="repo-panel">
            <h2 className="repo-panel-title">最近提交</h2>
            <div className="space-y-3">
              {data.commits?.map((commit: any) => (
                <a key={commit.sha} href={commit.html_url} target="_blank" rel="noreferrer" className="repo-commit-row block">
                  <div className="flex items-center gap-2 mb-1">
                    {commit.avatar_url && <img src={commit.avatar_url} alt="" className="repo-detail-avatar w-5 h-5" />}
                    <span className="text-xs font-mono" style={{ color: c }}>{commit.sha}</span>
                    <span className="text-xs truncate" style={{ color: '#71717a' }}>{commit.author}</span>
                  </div>
                  <p className="text-sm line-clamp-2" style={{ color: '#d4d4d8' }}>{commit.message}</p>
                  <p className="text-xs mt-1" style={{ color: '#52525b' }}>{timeAgo(commit.date)}</p>
                </a>
              ))}
              {!data.commits?.length && <div className="text-sm" style={{ color: '#71717a' }}>暂无提交记录</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
