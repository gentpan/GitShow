import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { ContributionGraph } from '@/components/home/ContributionGraph'
import { ExternalContributions } from '@/components/home/ExternalContributions'
import { LanguageChart } from '@/components/home/LanguageChart'
import { ProjectCard } from '@/components/home/ProjectCard'
import { Sidebar } from '@/components/home/Sidebar'
import { StatsGrid } from '@/components/home/StatsGrid'
import { TechStack } from '@/components/home/TechStack'
import { Card } from '@/components/home/ui/Card'
import { api } from '@/lib/api'
import { aggregateLanguages, deriveExternalContributions } from '@/lib/homeUtils'
import { themeMap } from '@/lib/utils'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const [me, setMe] = useState<any>(null)
  const [allRepos, setAllRepos] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])
  const [heatmap, setHeatmap] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [pending, setPending] = useState(true)
  const [sortBy, setSortBy] = useState<'stars' | 'updated'>('stars')

  useEffect(() => {
    Promise.all([
      api.getMe().then(setMe),
      api.getRepos().then(setAllRepos),
      api.getActivity(undefined, 30).then(setActivity),
      api.getHeatmap().then(setHeatmap),
      api.getSettings().then(setSettings),
    ]).finally(() => setPending(false))
  }, [])

  const theme = themeMap[(settings?.theme as keyof typeof themeMap) || 'green'] || themeMap.green
  const accent = theme.primary

  const repos = useMemo(() => {
    const count = settings?.homepage_repo_count || 6
    const selected: string[] = settings?.homepage_repos || []
    let list = selected.length
      ? selected.map((name: string) => allRepos.find((x) => x.name === name)).filter(Boolean)
      : [...allRepos]
    if (sortBy === 'stars') {
      list = [...list].sort((a: any, b: any) => b.stargazers_count - a.stargazers_count)
    } else {
      list = [...list].sort((a: any, b: any) => +new Date(b.updated_at) - +new Date(a.updated_at))
    }
    return list.slice(0, count)
  }, [allRepos, settings, sortBy])

  const languages = useMemo(() => aggregateLanguages(allRepos), [allRepos])

  const externalContribs = useMemo(() => deriveExternalContributions(activity), [activity])
  const totalPRs = useMemo(() => activity.filter((a) => a.type === 'PullRequestEvent').length, [activity])
  const totalCommits = useMemo(() => activity.filter((a) => a.type === 'PushEvent').length, [activity])

  if (pending) {
    return (
      <div className="home-page flex items-center justify-center py-20">
        <div className="loading-spinner w-8 h-8 border-2 animate-spin" style={{ borderColor: accent, borderTopColor: 'transparent' }} />
      </div>
    )
  }

  const displayName = me?.user?.login || settings?.github_username || 'Developer'

  return (
    <div className="home-page animate-fade-in">
      <div className="grid lg:grid-cols-[296px_1fr] gap-6 lg:gap-8">
        <Sidebar me={me} settings={settings} accent={accent} />

        <main className="space-y-6 min-w-0">
          <Card padding="lg" className="home-welcome-card">
            <h2 className="text-xl font-semibold home-gradient-text mb-1">
              Welcome to {displayName}&apos;s Hub
            </h2>
            <p className="text-sm text-[var(--home-text-secondary)]">
              Explore open source contributions and projects
            </p>
            <p className="text-xs text-[var(--home-text-tertiary)] mt-3">
              Powered by GitShow
            </p>
          </Card>

          <StatsGrid me={me} heatmap={heatmap} accent={accent} />

          <ContributionGraph heatmap={heatmap} accent={accent} />

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[var(--home-text-primary)] px-1">Tech Stack & Languages</h3>
              <TechStack languages={languages} bio={null} />
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-transparent px-1 select-none hidden md:block">.</h3>
              <LanguageChart languages={languages} />
            </div>
          </div>

          <ExternalContributions
            contributions={externalContribs}
            totalPRs={totalPRs}
            totalCommits={totalCommits}
            accent={accent}
          />

          {repos.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h3 className="text-sm font-medium text-[var(--home-text-primary)]">Notable Projects</h3>
                <div className="flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    className={`home-sort-btn home-rounded px-3 py-1.5 transition-colors ${sortBy === 'stars' ? 'home-sort-active' : ''}`}
                    onClick={() => setSortBy('stars')}
                  >
                    Most Stars
                  </button>
                  <button
                    type="button"
                    className={`home-sort-btn home-rounded px-3 py-1.5 transition-colors ${sortBy === 'updated' ? 'home-sort-active' : ''}`}
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
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
