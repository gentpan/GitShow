import { Badge } from '@/components/home/ui/Badge'
import type { ExternalContrib } from '@/lib/homeUtils'
import { formatNumber } from '@/lib/utils'

interface ExternalContributionsProps {
  contributions: ExternalContrib[]
  totalPRs: number
  totalCommits: number
  accent: string
}

export function ExternalContributions({ contributions, totalPRs, totalCommits, accent }: ExternalContributionsProps) {
  if (!contributions.length) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-sm font-medium text-[var(--home-text-primary)]">Open Source Contributions</h3>
        <div className="flex items-center gap-3 text-xs text-[var(--home-text-secondary)]">
          <span><span className="font-semibold" style={{ color: accent }}>{formatNumber(totalPRs)}</span> PRs</span>
          <span><span className="font-semibold" style={{ color: accent }}>{formatNumber(totalCommits)}</span> commits</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contributions.map((contrib) => (
          <a
            key={contrib.repoName}
            href={contrib.url}
            target="_blank"
            rel="noreferrer"
            className="home-card home-rounded home-card-hover block p-4 transition-all"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-medium text-sm truncate" style={{ color: accent }}>
                {contrib.repoName.split('/')[1] || contrib.repoName}
              </h4>
              {contrib.language && <Badge>{contrib.language}</Badge>}
            </div>

            <p className="text-xs text-[var(--home-text-secondary)] mb-3">
              Contributed to {contrib.owner}
            </p>

            <div className="flex items-center gap-3 text-xs text-[var(--home-text-tertiary)]">
              {contrib.prCount > 0 && (
                <span className="flex items-center gap-1">
                  <i className="fas fa-code-pull-request" />
                  {contrib.prCount}
                </span>
              )}
              {contrib.commitCount > 0 && (
                <span className="flex items-center gap-1">
                  <i className="fas fa-code-commit" />
                  {contrib.commitCount}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
