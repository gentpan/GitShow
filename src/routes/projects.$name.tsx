import { createFileRoute } from '@tanstack/react-router'
import { RepoDetailPage } from '@/components/RepoDetail'
import { getRepoDetailFn, getSettings } from '@/server/api'
import type { RepoDetailResponse, PublicSettings } from '@/server/types'

export const Route = createFileRoute('/projects/$name')({
  loader: async ({ params }) => {
    const [detail, settings] = await Promise.all([
      getRepoDetailFn({ data: { name: params.name } }),
      getSettings(),
    ])
    return { detail, settings } as { detail: RepoDetailResponse; settings: PublicSettings }
  },
  component: ProjectDetailRoute,
})

function ProjectDetailRoute() {
  const { name } = Route.useParams()
  const { detail, settings } = Route.useLoaderData()
  return <RepoDetailPage name={name} initialDetail={detail} initialSettings={settings} />
}
