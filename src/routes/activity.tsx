import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getActivity, getSettings } from '@/server/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useI18n, type MessageKey } from '@/lib/i18n'
import { themeMap, timeAgo } from '@/lib/utils'

const eventTypeKeys: { type: string; key: MessageKey; icon: string }[] = [
  { type: 'all', key: 'activity.all', icon: 'fas fa-layer-group' },
  { type: 'PushEvent', key: 'activity.push', icon: 'fas fa-code-commit' },
  { type: 'PullRequestEvent', key: 'activity.pr', icon: 'fas fa-code-merge' },
  { type: 'IssuesEvent', key: 'activity.issue', icon: 'fas fa-circle-dot' },
  { type: 'CreateEvent', key: 'activity.create', icon: 'fas fa-plus' },
  { type: 'WatchEvent', key: 'activity.star', icon: 'fas fa-star' },
  { type: 'ForkEvent', key: 'activity.fork', icon: 'fas fa-code-branch' },
  { type: 'ReleaseEvent', key: 'activity.release', icon: 'fas fa-tag' },
]

const typeMap: Record<string, { label: string; bg: string; color: string }> = {
  PushEvent: { label: 'push', bg: 'rgba(74,222,128,0.15)', color: '#4ade80' },
  CreateEvent: { label: 'create', bg: 'rgba(96,165,250,0.15)', color: '#60a5fa' },
  PullRequestEvent: { label: 'PR', bg: 'rgba(147,197,253,0.15)', color: '#93c5fd' },
  IssuesEvent: { label: 'issue', bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
  WatchEvent: { label: 'star', bg: 'rgba(244,114,132,0.15)', color: '#f472b6' },
  ForkEvent: { label: 'fork', bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
  ReleaseEvent: { label: 'release', bg: 'rgba(52,211,153,0.15)', color: '#34d399' },
}

export const Route = createFileRoute('/activity')({ component: ActivityPage })

function ActivityPage() {
  const { t, locale } = useI18n()
  const [selectedType, setSelectedType] = useState('all')

  const { data: feed, isPending: feedPending } = useQuery({
    queryKey: ['activity', 50],
    queryFn: () => getActivity({ data: { limit: 50 } }),
  })
  const { data: settings, isPending: settingsPending } = useQuery({
    queryKey: ['settings'],
    queryFn: () => getSettings(),
  })

  const pending = feedPending || settingsPending
  const c = (themeMap[(settings?.theme as keyof typeof themeMap) || 'green'] || themeMap.green).primary
  const filtered = useMemo(
    () =>
      selectedType === 'all'
        ? feed || []
        : (feed || []).filter((i: any) => i.type === selectedType),
    [feed, selectedType],
  )

  if (pending) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('activity.title')}</h1>
          <p className="page-subtitle">{t('activity.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {eventTypeKeys.map((item) => (
            <button
              key={item.type}
              type="button"
              className={`px-4 py-2 text-sm font-medium transition-colors ${selectedType === item.type ? 'active-filter' : 'inactive-filter'}`}
              onClick={() => setSelectedType(item.type)}
            >
              <i className={`${item.icon} mr-1`} />
              {t(item.key)}
            </button>
          ))}
        </div>
      </div>

      {!filtered.length ? (
        <div className="text-center py-20" style={{ color: 'var(--gs-text-secondary)' }}>
          {t('activity.empty')}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item: any) => {
            const st = typeMap[item.type] || {
              label: item.type,
              bg: 'rgba(161,161,170,0.15)',
              color: '#a1a1aa',
            }
            return (
              <div
                key={item.id}
                className="activity-row flex items-center gap-3 px-5 py-3.5 flex-wrap sm:flex-nowrap"
              >
                <img src={item.avatar} alt="" className="w-8 h-8 rounded-full shrink-0" />
                <span
                  className="text-xs shrink-0 px-2.5 py-1 rounded-full font-medium"
                  style={{ backgroundColor: st.bg, color: st.color }}
                >
                  {st.label}
                </span>
                <a
                  href={item.repo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="footer-text-link text-sm truncate min-w-0"
                  style={{ color: c }}
                >
                  {item.repo}
                </a>
                <span className="text-xs ml-auto shrink-0" style={{ color: 'var(--gs-text-secondary)' }}>
                  {timeAgo(item.created_at, locale)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
