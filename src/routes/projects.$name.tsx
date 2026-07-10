import { createFileRoute } from '@tanstack/react-router'
import { RepoDetailPage } from '@/components/RepoDetail'
import { getPublicSettingsFn, getRepoDetailFn } from '@/lib/serverFns/repo'

export const Route = createFileRoute('/projects/$name')({
  loader: async ({ params }) => {
    const [detail, settings] = await Promise.all([
      getRepoDetailFn({ data: { name: params.name } }),
      getPublicSettingsFn(),
    ])
    return { detail, settings }
  },
  component: ProjectDetailRoute,
})

function ProjectDetailRoute() {
  const { name } = Route.useParams()
  const { detail, settings } = Route.useLoaderData()
  return <RepoDetailPage name={name} initialDetail={detail} initialSettings={settings} />
}
