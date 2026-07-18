import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ContributionGraph } from '@/components/home/ContributionGraph'
import { ExternalContributions } from '@/components/home/ExternalContributions'
import { LanguageChart } from '@/components/home/LanguageChart'
import { ProjectCard } from '@/components/home/ProjectCard'
import { Sidebar } from '@/components/home/Sidebar'
import { StatsGrid } from '@/components/home/StatsGrid'
import { TechStack } from '@/components/home/TechStack'
import { Card } from '@/components/home/ui/Card'
import { getMe, getRepos, getActivity, getHeatmap, getSettings } from '@/server/api'
import { aggregateLanguages, deriveExternalContributions } from '@/lib/homeUtils'
import { themeMap } from '@/lib/utils'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const [sortBy, setSortBy] = useState<'stars' | 'updated'>('stars')

  const { data: me, isPending: mePending } = useQuery({
    queryKey: ['me'],
    queryFn: () => getMe(),
  })
  const { data: allRepos, isPending: reposPending } = useQuery({
    queryKey: ['repos'],
    queryFn: () => getRepos(),
  })
  const { data: activity, isPending: activityPending } = useQuery({
    queryKey: ['activity'],
    queryFn: () => getActivity({ data: { limit: 30 } }),
  })
  const { data: heatmap, isPending: heatmapPending } = useQuery({
    queryKey: ['heatmap'],
    queryFn: () => getHeatmap(),
  })
  const { data: settings, isPending: settingsPending } = useQuery({
    queryKey: ['settings'],
    queryFn: () => getSettings(),
  })

  const pending = mePending || reposPending || activityPending || heatmapPending || settingsPending

  const theme = themeMap[(settings?.theme as keyof typeof themeMap) || 'blue'] || themeMap.blue
  const accent = theme.primary

  const repos = useMemo(() => {
    const count = settings?.homepage_repo_count || 6
    const selected: string[] = settings?.homepage_repos || []
    let list = selected.length
      ? selected.map((name: string) => allRepos?.find((x: any) => x.name === name)).filter(Boolean)
      : [...(allRepos || [])]
    if (sortBy === 'stars') {
      list = [...list].sort((a: any, b: any) => b.stargazers_count - a.stargazers_count)
    } else {
      list = [...list].sort((a: any, b: any) => +new Date(b.updated_at) - +new Date(a.updated_at))
    }
    return list.slice(0, count)
  }, [allRepos, settings, sortBy])

  const languages = useMemo(() => aggregateLanguages(allRepos || []), [allRepos])

  const externalContribs = useMemo(() => deriveExternalContributions(activity || []), [activity])
  const totalPRs = useMemo(() => (activity || []).filter((a: any) => a.type === 'PullRequestEvent').length, [activity])
  const totalCommits = useMemo(() => (activity || []).filter((a: any) => a.type === 'PushEvent').length, [activity])

  if (pending) {
    return (
      <div className="home-page flex items-center justify-center py-20">
        <div
          className="loading-spinner w-8 h-8 border-2 animate-spin"
          style={{ borderColor: accent, borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  const displayName = me?.user?.login || settings?.github_username || 'Developer'

  return (
    <div className="home-page animate-fade-in">
      <div className="grid lg:grid-cols-[300px_1fr] gap-8 lg:gap-10">
        <div className="gs-rise">
          <Sidebar me={me} settings={settings} accent={accent} />
        </div>

        <div className="space-y-8 min-w-0">
          <Card padding="none" className="home-welcome-card gs-rise gs-rise-delay-1 overflow-hidden">
            <p className="gs-caption mb-3" style={{ color: 'var(--gs-interactive)' }}>
              Developer Hub
            </p>
            <h1 className="gs-h3 home-gradient-text mb-3">
              Welcome to {displayName}&apos;s Hub
            </h1>
            <p className="gs-body-sm" style={{ color: 'var(--home-text-secondary)', maxWidth: 560 }}>
              Explore open source contributions, tech stack, and notable projects in one place.
            </p>
          </Card>

          <section className="gs-rise gs-rise-delay-2 space-y-3">
            <h2 className="gs-h4 px-1">Overview</h2>
            <StatsGrid me={me} heatmap={heatmap || []} accent={accent} />
          </section>

          <section className="space-y-3">
            <h2 className="gs-h4 px-1">Contributions</h2>
            <ContributionGraph heatmap={heatmap || []} accent={accent} />
          </section>

          <section className="space-y-3">
            <h2 className="gs-h4 px-1">Tech Stack & Languages</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <TechStack languages={languages} bio={null} />
              <LanguageChart languages={languages} />
            </div>
          </section>

          <ExternalContributions
            contributions={externalContribs}
            totalPRs={totalPRs}
            totalCommits={totalCommits}
            accent={accent}
          />

          {repos.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className="gs-h4">Notable Projects</h2>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    className={`home-sort-btn px-4 py-2 transition-colors ${sortBy === 'stars' ? 'home-sort-active' : ''}`}
                    onClick={() => setSortBy('stars')}
                  >
                    Most Stars
                  </button>
                  <button
                    type="button"
                    className={`home-sort-btn px-4 py-2 transition-colors ${sortBy === 'updated' ? 'home-sort-active' : ''}`}
                    onClick={() => setSortBy('updated')}
                  >
                    Recently Updated
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {repos.map((repo: any) => (
                  <ProjectCard key={repo.id} repo={repo} accent={accent} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
