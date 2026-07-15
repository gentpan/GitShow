import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { SiteLayout } from '@/components/SiteLayout'
import appCss from '@/styles.css?url'
import markdownReadmeCss from '@/markdown-readme.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [{ charSet: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }, { title: 'GitShow' }],
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
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }))

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
