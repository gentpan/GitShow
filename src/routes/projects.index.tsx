import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ProjectCard } from '@/components/home/ProjectCard'
import { getRepos, getSettings } from '@/server/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { themeMap } from '@/lib/utils'

export const Route = createFileRoute('/projects/')({ component: ProjectsPage })

function ProjectsPage() {
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
          <h1 className="page-title">所有项目</h1>
          <p className="page-subtitle">后台未开启任何项目</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">所有项目</h1>
          <p className="page-subtitle">精选仓库与开源作品</p>
        </div>
        <span className="gs-tag">{filteredRepos.length} 个仓库</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRepos.map((repo: any) => (
          <ProjectCard key={repo.id} repo={repo} accent={c} />
        ))}
      </div>
    </div>
  )
}
