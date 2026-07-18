import { Badge } from '@/components/home/ui/Badge'
import type { ExternalContrib } from '@/lib/homeUtils'
import { useI18n } from '@/lib/i18n'
import { formatNumber } from '@/lib/utils'

interface ExternalContributionsProps {
  contributions: ExternalContrib[]
  totalPRs: number
  totalCommits: number
  accent: string
}

export function ExternalContributions({
  contributions,
  totalPRs,
  totalCommits,
  accent,
}: ExternalContributionsProps) {
  const { t } = useI18n()
  if (!contributions.length) return null

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="gs-h4">{t('external.title')}</h2>
          <p className="gs-caption mt-1" style={{ color: 'var(--home-text-tertiary)' }}>
            {t('external.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--home-text-secondary)]">
          <span>
            <span className="font-semibold" style={{ color: accent }}>
              {formatNumber(totalPRs)}
            </span>{' '}
            {t('external.prs')}
          </span>
          <span>
            <span className="font-semibold" style={{ color: accent }}>
              {formatNumber(totalCommits)}
            </span>{' '}
            {t('external.commits')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contributions.map((contrib) => (
          <a
            key={contrib.repoName}
            href={contrib.url}
            target="_blank"
            rel="noreferrer"
            className="home-card home-card-hover block p-6 transition-all"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-medium text-sm truncate" style={{ color: accent }}>
                {contrib.repoName.split('/')[1] || contrib.repoName}
              </h4>
              {contrib.language && <Badge>{contrib.language}</Badge>}
            </div>

            <p className="text-xs text-[var(--home-text-secondary)] mb-3">
              {t('external.to', { owner: contrib.owner })}
            </p>

            <div className="flex items-center gap-3 text-xs text-[var(--home-text-tertiary)]">
              {contrib.prCount > 0 && (
                <span className="flex items-center gap-1">
                  <i className="fas fa-code-pull-request" />
                  {contrib.prCount} {t('external.prs')}
                </span>
              )}
              {contrib.commitCount > 0 && (
                <span className="flex items-center gap-1">
                  <i className="fas fa-code-commit" />
                  {contrib.commitCount} {t('external.commits')}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
