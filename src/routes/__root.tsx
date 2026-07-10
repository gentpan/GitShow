import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { SiteLayout } from '@/components/SiteLayout'
import appCss from '@/styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [{ charSet: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }, { title: 'GitShow' }],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://static.utterlog.com/libs/fontawesome/7.2.0/css/all.min.css' },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <html lang="zh-CN">
      <head><HeadContent /></head>
      <body>
        <SiteLayout><Outlet /></SiteLayout>
        <Scripts />
      </body>
    </html>
  )
}
