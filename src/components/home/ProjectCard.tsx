import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/home/ui/Badge'
import { useI18n } from '@/lib/i18n'
import { formatNumber, langColor, timeAgo } from '@/lib/utils'

interface ProjectCardProps {
  repo: any
  accent: string
}

export function ProjectCard({ repo, accent }: ProjectCardProps) {
  const { t, locale } = useI18n()
  const lang = repo.language

  return (
    <Link
      to="/projects/$name"
      params={{ name: repo.name }}
      className="home-card home-card-hover flex flex-col h-full transition-all overflow-hidden"
    >
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4
            className="font-medium text-sm truncate flex items-center gap-2 min-w-0"
            style={{ color: accent }}
          >
            <i className="fas fa-bookmark text-xs shrink-0 opacity-70" />
            <span className="truncate">{repo.name}</span>
            {repo.latest_version && (
              <span className="shrink-0 font-normal text-[var(--home-text-tertiary)]">
                {repo.latest_version}
              </span>
            )}
          </h4>
          {lang && <Badge color={langColor(lang)}>{lang}</Badge>}
        </div>

        <p className="text-sm text-[var(--home-text-secondary)] line-clamp-2 min-h-[40px] mb-3">
          {repo.description || t('project.noDescription')}
        </p>

        <div className="flex items-center justify-between gap-3 text-xs text-[var(--home-text-tertiary)]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {formatNumber(repo.stargazers_count)}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              {formatNumber(repo.forks_count)}
            </span>
          </div>
          {repo.updated_at && <span>{timeAgo(repo.updated_at, locale)}</span>}
        </div>
      </div>
    </Link>
  )
}
