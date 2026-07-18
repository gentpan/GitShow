import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getFollowing } from '@/server/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useI18n } from '@/lib/i18n'
import { langColor, timeAgo } from '@/lib/utils'

export const Route = createFileRoute('/following')({ component: FollowingPage })

function FollowingPage() {
  const { t, locale } = useI18n()
  const { data: following, isPending: pending } = useQuery({
    queryKey: ['following'],
    queryFn: () => getFollowing(),
  })

  const sorted = useMemo(
    () =>
      [...(following || [])].sort(
        (a: any, b: any) => +new Date(b.last_active || 0) - +new Date(a.last_active || 0),
      ),
    [following],
  )

  if (pending) {
    return <LoadingSpinner />
  }

  if (!sorted.length) {
    return (
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('following.title')}</h1>
          <p className="page-subtitle">{t('following.empty')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('following.title')}</h1>
          <p className="page-subtitle">{t('following.subtitle')}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sorted.map((user: any) => (
          <div key={user.username} className="gs-card p-6">
            <div className="flex items-center gap-3">
              <img src={user.avatar_url} className="w-12 h-12 rounded-full" alt="" />
              <div className="min-w-0">
                <a
                  href={`https://github.com/${user.username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold truncate block footer-text-link"
                  style={{ color: 'var(--gs-text)' }}
                >
                  {user.username}
                </a>
                {user.bio && (
                  <p className="text-xs truncate" style={{ color: 'var(--gs-text-secondary)' }}>
                    {user.bio}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3 text-xs" style={{ color: 'var(--gs-text-secondary)' }}>
              {user.last_active
                ? t('following.lastActive', { time: timeAgo(user.last_active, locale) })
                : t('following.noActivity')}
            </div>

            {user.recent_repos?.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-medium mb-2" style={{ color: 'var(--gs-text-secondary)' }}>
                  {t('following.recentRepos')}
                </div>
                <div className="space-y-1.5">
                  {user.recent_repos.slice(0, 3).map((repo: any) => (
                    <a
                      key={repo.id}
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="following-repo-row flex items-center justify-between text-sm px-3 py-1.5"
                    >
                      <span className="truncate" style={{ color: 'var(--gs-text)' }}>
                        {repo.name}
                      </span>
                      <div
                        className="flex items-center gap-2 text-xs shrink-0 ml-2"
                        style={{ color: 'var(--gs-text-secondary)' }}
                      >
                        {repo.language && (
                          <span className="flex items-center gap-1">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: langColor(repo.language) }}
                            />
                            {repo.language}
                          </span>
                        )}
                        <span className="flex items-center gap-0.5">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
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
                <div className="text-xs font-medium mb-2" style={{ color: 'var(--gs-text-secondary)' }}>
                  {t('following.recentCommits')}
                </div>
                <div className="space-y-2">
                  {user.recent_events.slice(0, 2).map((evt: any) => (
                    <div key={evt.id} className="text-xs">
                      <div className="truncate" style={{ color: 'var(--gs-text)' }}>
                        {evt.message || `pushed to ${evt.repo}`}
                      </div>
                      <div className="mt-0.5" style={{ color: 'var(--gs-text-secondary)' }}>
                        {evt.repo} · {timeAgo(evt.created_at, locale)}
                      </div>
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
