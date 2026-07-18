import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { SiteLayout } from '@/components/SiteLayout'
import { getSettings } from '@/server/api'
import appCss from '@/styles.css?url'
import markdownReadmeCss from '@/markdown-readme.css?url'

export const Route = createRootRoute({
  loader: async () => {
    const settings = await getSettings()
    return { settings }
  },
  head: ({ loaderData }) => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: loaderData?.settings?.title || 'GitShow' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'stylesheet', href: markdownReadmeCss },
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap' },
      { rel: 'stylesheet', href: 'https://static.utterlog.com/libs/fontawesome/7.2.0/css/all.min.css' },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  const { settings } = Route.useLoaderData()
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          refetchOnWindowFocus: false,
        },
      },
    })
    client.setQueryData(['settings'], settings)
    return client
  })

  return (
    <html lang="zh-CN">
      <head><HeadContent /></head>
      <body>
        <QueryClientProvider client={queryClient}>
          <SiteLayout><Outlet /></SiteLayout>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
