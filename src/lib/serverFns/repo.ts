import { createServerFn } from '@tanstack/react-start'
import { buildRepoContents, buildRepoDetail } from '../../../api/utils/repoDetail'
import { getPublicSettings } from '../../../api/utils/config'
import type { PublicSettings, RepoDetailResponse } from '../../../api/utils/types'

function sanitizeReadme(html: string | null): string | null {
  if (!html) return null
  return html.replace(/<script[\s\S]*?<\/script>/gi, '')
}

export const getRepoDetailFn = createServerFn({ method: 'GET' })
  .validator((data: { name: string }) => data)
  .handler(async ({ data }) => {
    const detail = await buildRepoDetail(data.name)
    return {
      ...detail,
      readme_html: sanitizeReadme(detail.readme_html),
    }
  })

export const getRepoContentsFn = createServerFn({ method: 'GET' })
  .validator((data: { name: string; path?: string }) => data)
  .handler(async ({ data }) => buildRepoContents(data.name, data.path || ''))

export const getPublicSettingsFn = createServerFn({ method: 'GET' }).handler(async () => getPublicSettings())

export type RepoDetailData = RepoDetailResponse
export type PublicSettingsData = PublicSettings
