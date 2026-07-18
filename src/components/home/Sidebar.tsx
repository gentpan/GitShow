import { useMemo } from 'react'
import { Badge } from '@/components/home/ui/Badge'
import { Card } from '@/components/home/ui/Card'
import { getTotalContributions, type LanguageStat } from '@/lib/homeUtils'
import { useI18n } from '@/lib/i18n'
import {
  generateProfileTags,
  getActiveDays,
  getContributionStreak,
  getWeekendContributionShare,
  getYearsActiveFromCreatedAt,
} from '@/lib/profileTags'

interface SidebarProps {
  me: any
  settings: any
  heatmap?: { date?: string; count?: number }[]
  languages?: LanguageStat[]
  totalForks?: number
}

export function Sidebar({
  me,
  settings,
  heatmap = [],
  languages = [],
  totalForks = 0,
}: SidebarProps) {
  const { t } = useI18n()
  const user = me?.user
  const pronouns =
    me?.gender === 'female' ? 'She/Her' : me?.gender === 'male' ? 'He/Him' : null
  const location = me?.location || user?.location || ''

  const profileTags = useMemo(() => {
    const yearsFromAccount = getYearsActiveFromCreatedAt(user?.created_at)
    return generateProfileTags({
      totalStars: me?.stats?.total_stars || 0,
      totalRepos: me?.stats?.total_repos || 0,
      totalForks,
      totalCommits: me?.stats?.total_commits || 0,
      followers: user?.followers || 0,
      following: me?.following_count ?? user?.following ?? 0,
      totalContributions: getTotalContributions(heatmap),
      yearsActive: yearsFromAccount,
      topLanguage: languages[0]?.name || null,
      languageCount: languages.length,
      streakDays: getContributionStreak(heatmap),
      activeDays: getActiveDays(heatmap),
      weekendShare: getWeekendContributionShare(heatmap),
    })
  }, [me, user, heatmap, languages, totalForks])

  return (
    <aside className="home-sidebar space-y-4 lg:sticky lg:top-24 lg:self-start">
      <Card padding="none" className="overflow-hidden">
        <div className="p-6 flex flex-col items-center text-center border-b border-[var(--home-border)]">
          <img
            src={user?.avatar_url}
            alt=""
            className="home-avatar home-rounded-full w-48 h-48 object-cover mb-4"
          />
          {user?.name && (
            <h2 className="text-lg font-semibold text-[var(--home-text-primary)]">{user.name}</h2>
          )}
          <p className="text-sm text-[var(--home-text-secondary)]">@{user?.login}</p>
        </div>

        <div className="p-6 space-y-4">
          {user?.bio && (
            <p className="text-sm text-[var(--home-text-secondary)] leading-relaxed">{user.bio}</p>
          )}

          <a
            href={user?.html_url}
            target="_blank"
            rel="noreferrer"
            className="home-btn-primary w-full"
          >
            <i className="fab fa-github" />
            {t('sidebar.followGithub')}
          </a>

          {(pronouns || profileTags.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {pronouns && <Badge icon="fas fa-user">{pronouns}</Badge>}
              {profileTags.map((tag) => (
                <Badge key={tag.key} icon={tag.icon}>
                  {t(tag.key)}
                </Badge>
              ))}
            </div>
          )}

          <div className="space-y-2 text-sm text-[var(--home-text-secondary)]">
            {location && (
              <div className="flex items-center gap-2">
                <i className="fas fa-location-dot w-4 text-center text-[var(--home-text-tertiary)]" />
                <span>{location}</span>
              </div>
            )}
            {settings?.contact_url && (
              <div className="flex items-center gap-2 min-w-0">
                <i className="fas fa-link w-4 text-center text-[var(--home-text-tertiary)] shrink-0" />
                <a
                  href={settings.contact_url}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate hover:text-[var(--home-accent)] transition-colors"
                >
                  {settings.contact_url.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[var(--home-border)] text-sm text-[var(--home-text-secondary)]">
            <span className="font-semibold text-[var(--home-text-primary)]">
              {user?.followers ?? 0}
            </span>{' '}
            {t('sidebar.followers')}
            <span className="mx-1">·</span>
            <span className="font-semibold text-[var(--home-text-primary)]">
              {me?.following_count ?? user?.following ?? 0}
            </span>{' '}
            {t('sidebar.following')}
          </div>
        </div>
      </Card>
    </aside>
  )
}
