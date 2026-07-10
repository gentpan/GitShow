import { createFileRoute } from '@tanstack/react-router'
import { RepoDetailPage } from '@/components/RepoDetail'

export const Route = createFileRoute('/projects/$name')({
  component: ProjectDetailRoute,
})

function ProjectDetailRoute() {
  const { name } = Route.useParams()
  return <RepoDetailPage name={name} />
}
