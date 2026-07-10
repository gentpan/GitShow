import { createFileRoute } from '@tanstack/react-router'
import { RepoDetailPage } from '@/components/RepoDetail'
import { api } from '@/lib/api'
import type { PublicSettings, RepoDetailResponse } from '../../api/utils/types'

async function loadProjectDetail(name: string): Promise<{
  detail: RepoDetailResponse
  settings: PublicSettings
}> {
  if (import.meta.env.SSR) {
    const { buildRepoDetail } = await import('../../api/utils/repoDetail')
    const { getPublicSettings } = await import('../../api/utils/config')
    const [detail, settings] = await Promise.all([
      buildRepoDetail(name),
      Promise.resolve(getPublicSettings()),
    ])
    return { detail, settings }
  }

  const [detail, settings] = await Promise.all([
    api.getRepoDetail(name),
    api.getSettings(),
  ])
  return { detail, settings }
}

export const Route = createFileRoute('/projects/$name')({
  loader: async ({ params }) => loadProjectDetail(params.name),
  component: ProjectDetailRoute,
})

function ProjectDetailRoute() {
  const { name } = Route.useParams()
  const { detail, settings } = Route.useLoaderData()
  return <RepoDetailPage name={name} initialDetail={detail} initialSettings={settings} />
}
