import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ProjectCard } from '@/components/home/ProjectCard'
import { getRepos, getSettings } from '@/server/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useI18n } from '@/lib/i18n'
import { themeMap } from '@/lib/utils'

export const Route = createFileRoute('/projects/')({ component: ProjectsPage })

function ProjectsPage() {
  const { t } = useI18n()
  const { data: repos = [], isPending: reposPending } = useQuery({
    queryKey: ['repos'],
    queryFn: () => getRepos(),
  })
  const { data: settings, isPending: settingsPending } = useQuery({
    queryKey: ['settings'],
    queryFn: () => getSettings(),
  })

  const pending = reposPending || settingsPending
  const theme = themeMap[(settings?.theme as keyof typeof themeMap) || 'green'] || themeMap.green
  const c = theme.primary

  const filteredRepos = useMemo(() => {
    const selected: string[] = settings?.homepage_repos || []
    if (!selected.length) return []
    return selected
      .map((name) => repos.find((r: any) => r.name === name || r.full_name === name))
      .filter(Boolean)
  }, [repos, settings])

  if (pending) {
    return <LoadingSpinner />
  }

  if (!filteredRepos.length) {
    return (
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('projects.title')}</h1>
          <p className="page-subtitle">{t('projects.empty')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('projects.title')}</h1>
          <p className="page-subtitle">{t('projects.subtitle')}</p>
        </div>
        <span className="gs-tag">{t('projects.count', { n: filteredRepos.length })}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRepos.map((repo: any) => (
          <ProjectCard key={repo.id} repo={repo} accent={c} />
        ))}
      </div>
    </div>
  )
}
