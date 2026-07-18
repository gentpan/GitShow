import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { SiteLayout } from '@/components/SiteLayout'
import { I18nProvider } from '@/lib/i18n'
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
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      { rel: 'icon', href: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { rel: 'icon', href: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { rel: 'shortcut icon', href: '/favicon.ico' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
      { rel: 'manifest', href: '/site.webmanifest' },
      { rel: 'stylesheet', href: 'https://static.bluecdn.com/fonts/alimama-fangyuanti.css' },
      { rel: 'stylesheet', href: 'https://static.bluecdn.com/libs/fontawesome/7.3.0/css/all.min.css' },
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
          <I18nProvider>
            <SiteLayout><Outlet /></SiteLayout>
          </I18nProvider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
