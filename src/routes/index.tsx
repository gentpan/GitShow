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
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { themeMap } from '@/lib/utils'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const [sortBy, setSortBy] = useState<'stars' | 'updated'>('stars')
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null)

  const { data: me, isPending: mePending } = useQuery({
    queryKey: ['me'],
    queryFn: () => getMe(),
  })
  const { data: allRepos, isPending: reposPending } = useQuery({
    queryKey: ['repos'],
    queryFn: () => getRepos(),
  })
  const { data: activity, isPending: activityPending } = useQuery({
    queryKey: ['activity', 50],
    queryFn: () => getActivity({ data: { limit: 50 } }),
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

  const theme = themeMap[(settings?.theme as keyof typeof themeMap) || 'green'] || themeMap.green
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

  const languages = useMemo(() => aggregateLanguages(allRepos || [], 100), [allRepos])
  const topLanguages = useMemo(() => languages.slice(0, 5), [languages])

  const chartActiveLanguage =
    activeLanguage && topLanguages.some((l) => l.name === activeLanguage)
      ? activeLanguage
      : topLanguages[0]?.name || null
  const stackActiveLanguage = activeLanguage || chartActiveLanguage

  const totalForks = useMemo(
    () => (allRepos || []).reduce((sum: number, r: any) => sum + (r.forks_count || 0), 0),
    [allRepos],
  )

  const selfUsername = me?.user?.login || settings?.github_username || ''
  const externalContribs = useMemo(
    () => deriveExternalContributions(activity || [], selfUsername),
    [activity, selfUsername],
  )
  const totalPRs = useMemo(
    () =>
      externalContribs.reduce((sum, c) => sum + c.prCount, 0),
    [externalContribs],
  )
  const totalCommits = useMemo(
    () => externalContribs.reduce((sum, c) => sum + c.commitCount, 0),
    [externalContribs],
  )

  if (pending) {
    return <LoadingSpinner className="home-page" />
  }

  const displayName = me?.user?.name || me?.user?.login || settings?.github_username || '开发者'
  const bioHint = me?.user?.bio?.trim()
  const welcomeLine = bioHint
    ? bioHint
    : '开源贡献、技术栈与精选项目，记录持续构建的过程。'

  return (
    <div className="home-page animate-fade-in">
      <div className="home-lattice">
        <aside className="home-lattice-sidebar">
          <Sidebar
            me={me}
            settings={settings}
            heatmap={heatmap || []}
            languages={languages}
            totalForks={totalForks}
          />
        </aside>

        <div className="home-lattice-main">
          <section className="home-lattice-block">
            <Card padding="none" className="home-welcome-card overflow-hidden">
              <h1 className="gs-h3 mb-2">{displayName} 的开发者主页</h1>
              <p className="gs-body-sm" style={{ color: 'var(--home-text-secondary)', maxWidth: 560 }}>
                {welcomeLine}
              </p>
            </Card>
          </section>

          <section className="home-lattice-block space-y-3">
            <h2 className="gs-h4 px-1">概览</h2>
            <StatsGrid me={me} heatmap={heatmap || []} accent={accent} />
          </section>

          <section className="home-lattice-block space-y-3">
            <h2 className="gs-h4 px-1">贡献</h2>
            <ContributionGraph heatmap={heatmap || []} />
          </section>

          <section className="home-lattice-block space-y-3">
            <h2 className="gs-h4 px-1">技术栈与语言</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <TechStack
                languages={languages}
                activeLanguage={stackActiveLanguage}
                onActiveLanguageChange={setActiveLanguage}
              />
              <LanguageChart
                languages={topLanguages}
                activeLanguage={chartActiveLanguage}
                onActiveLanguageChange={setActiveLanguage}
              />
            </div>
          </section>

          {externalContribs.length > 0 && (
            <section className="home-lattice-block">
              <ExternalContributions
                contributions={externalContribs}
                totalPRs={totalPRs}
                totalCommits={totalCommits}
                accent={accent}
              />
            </section>
          )}

          {repos.length > 0 && (
            <section className="home-lattice-block space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className="gs-h4">精选项目</h2>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    className={`home-sort-btn px-4 py-2 transition-colors ${sortBy === 'stars' ? 'home-sort-active' : ''}`}
                    onClick={() => setSortBy('stars')}
                  >
                    按 Star
                  </button>
                  <button
                    type="button"
                    className={`home-sort-btn px-4 py-2 transition-colors ${sortBy === 'updated' ? 'home-sort-active' : ''}`}
                    onClick={() => setSortBy('updated')}
                  >
                    最近更新
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
