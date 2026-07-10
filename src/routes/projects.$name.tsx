import { createFileRoute } from '@tanstack/react-router'
import { RepoDetailPage } from '@/components/RepoDetail'
import type { PublicSettings, RepoDetailResponse } from '../../api/utils/types'

async function loadProjectDetail(name: string): Promise<{
  detail: RepoDetailResponse
  settings: PublicSettings
}> {
  const origin = import.meta.env.SSR
    ? `http://127.0.0.1:${process.env.PORT || 3000}`
    : ''

  const [detailRes, settingsRes] = await Promise.all([
    fetch(`${origin}/api/repos/${encodeURIComponent(name)}`),
    fetch(`${origin}/api/settings`),
  ])

  if (!detailRes.ok) {
    throw new Error('repo not found')
  }

  const [detail, settings] = await Promise.all([
    detailRes.json() as Promise<RepoDetailResponse>,
    settingsRes.json() as Promise<PublicSettings>,
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
