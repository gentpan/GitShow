import { Link, useRouterState } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSettings, getMe, adminLogin } from '@/server/api'
import { adminAuth, passkey } from '@/lib/auth'
import { darkenColor, themeMap } from '@/lib/utils'
import { GitShowFooterLogo } from '@/components/GitShowFooterLogo'
import { GitShowLogo } from '@/components/GitShowLogo'
import { LatticeCross } from '@/components/LatticeCross'

const baseNavLinks = [
  { path: '/', label: '主页', icon: 'fas fa-house' },
  { path: '/projects', label: '项目', icon: 'fas fa-folder' },
  { path: '/following', label: '关注', icon: 'fas fa-user-plus' },
  { path: '/activity', label: '看板', icon: 'fas fa-chart-bar' },
]

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [mobileOpen, setMobileOpen] = useState(false)
  const [navHidden, setNavHidden] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [passkeyLoading, setPasskeyLoading] = useState(false)
  const [loggedIn, setLoggedIn] = useState(() => adminAuth.isLoggedIn())

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => getSettings(),
  })
  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => getMe(),
  })

  useEffect(() => {
    setLoggedIn(adminAuth.isLoggedIn())
  }, [pathname])

  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      const delta = y - lastY
      if (y < 24) setNavHidden(false)
      else if (delta > 8) setNavHidden(true)
      else if (delta < -8) setNavHidden(false)
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const theme = themeMap[(settings?.theme as keyof typeof themeMap) || 'green'] || themeMap.green
  const navLinks = useMemo(() => {
    const links = [...baseNavLinks]
    if (loggedIn) links.push({ path: '/admin', label: '管理', icon: 'fas fa-gear' })
    return links
  }, [loggedIn])

  const rootStyle = {
    ['--theme-primary' as string]: theme.primary,
    ['--theme-primary-rgb' as string]: theme.rgb,
    ['--theme-primary-dark' as string]: darkenColor(theme.primary),
    ['--home-accent' as string]: theme.primary,
  } as React.CSSProperties

  const contactUrl = settings?.contact_url || me?.user?.html_url || 'https://github.com'
  const brand = settings?.title || 'GitShow'
  /** Only show Passkey login when at least one is configured in admin. */
  const showPasskeyLogin = Boolean(settings?.has_passkey) && passkey.isSupported()

  async function login() {
    try {
      await adminLogin({ data: { password } })
      adminAuth.login()
      sessionStorage.setItem('admin_password', password)
      setPassword('')
      setLoginError('')
      setShowLogin(false)
      setLoggedIn(true)
      window.location.href = '/admin'
    } catch {
      setLoginError('密码错误')
    }
  }

  async function loginPasskey() {
    setPasskeyLoading(true)
    setLoginError('')
    try {
      await passkey.loginWithPasskey()
      adminAuth.login()
      sessionStorage.removeItem('admin_password')
      setShowLogin(false)
      setLoggedIn(true)
      window.location.href = '/admin'
    } catch {
      setLoginError('Passkey 验证失败')
    } finally {
      setPasskeyLoading(false)
    }
  }

  function isActive(path: string) {
    if (path === '/') return pathname === '/'
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  return (
    <div className="gs-shell" style={rootStyle}>
      <div className="gs-lattice">
        <LatticeCross position="tl" />
        <LatticeCross position="tr" />
        <LatticeCross position="bl" />
        <LatticeCross position="br" />
        {/* header / content rail junctions */}
        <span className="gs-lattice-cross gs-lattice-cross-ml gs-lattice-header-mark" aria-hidden />
        <span className="gs-lattice-cross gs-lattice-cross-mr gs-lattice-header-mark" aria-hidden />

        <header className={`nav-shell ${navHidden && !mobileOpen ? 'nav-shell-hidden' : ''}`}>
          <div className="gs-container nav-bar">
            <Link to="/" className="nav-brand" activeProps={{ className: 'nav-brand' }} aria-label={brand}>
              <GitShowLogo className="nav-brand-logo" />
            </Link>

            <nav className="nav-links hidden sm:flex" aria-label="主导航">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link ${isActive(link.path) ? 'nav-link-active' : ''}`}
                  activeProps={{
                    className: `nav-link ${isActive(link.path) ? 'nav-link-active' : ''}`,
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden sm:flex items-center gap-3">
              <a href={contactUrl} target="_blank" rel="noreferrer" className="contact-btn">
                <i className="fas fa-paper-plane text-xs" />
                {settings?.contact_label || '联系'}
              </a>
            </div>

            <button
              type="button"
              className="btn-icon sm:hidden"
              aria-label={mobileOpen ? '关闭菜单' : '打开菜单'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <i className={mobileOpen ? 'fas fa-xmark text-base' : 'fas fa-bars text-sm'} />
            </button>
          </div>

          {mobileOpen && (
            <div className="mobile-menu-panel sm:hidden">
              <div className="gs-container py-3 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`nav-link ${isActive(link.path) ? 'nav-link-active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <i className={`${link.icon} text-xs w-4 text-center`} />
                    {link.label}
                  </Link>
                ))}
                <a
                  href={contactUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="contact-btn w-full mt-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <i className="fas fa-paper-plane text-xs" />
                  {settings?.contact_label || '联系'}
                </a>
              </div>
            </div>
          )}
        </header>

        <main className="gs-main">
          <div className="gs-container">{children}</div>
        </main>

        <footer className="gs-footer">
          <span className="gs-lattice-cross gs-lattice-cross-ml" style={{ top: 0 }} aria-hidden />
          <span className="gs-lattice-cross gs-lattice-cross-mr" style={{ top: 0 }} aria-hidden />
          <div className="gs-container py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div
              className="gs-body-sm flex flex-wrap items-center justify-center gap-1.5"
              style={{ color: 'var(--gs-text-secondary)' }}
            >
              <span>
                © {new Date().getFullYear()} {brand}
              </span>
              <span>·</span>
              <span>build with</span>
              <a
                href="https://github.com/gentpan/GitShow"
                target="_blank"
                rel="noreferrer"
                className="footer-gitshow-link"
                aria-label="GitShow"
              >
                <GitShowFooterLogo className="footer-gitshow-logo" />
              </a>
            </div>
            <div className="flex items-center gap-2">
              {(settings?.social_links || []).map((link: any, i: number) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-icon footer-icon-link"
                  title={link.url}
                >
                  <i className={link.icon} />
                </a>
              ))}
              {loggedIn ? (
                <button
                  type="button"
                  className="btn-icon footer-logout-button"
                  title="退出登录"
                  onClick={() => {
                    adminAuth.logout()
                    setLoggedIn(false)
                    if (pathname === '/admin') window.location.href = '/'
                  }}
                >
                  <i className="fas fa-right-from-bracket" />
                </button>
              ) : (
                <div className="relative">
                  {showLogin && (
                    <div className="footer-login-popover absolute bottom-full right-0 mb-2 w-64 p-4 space-y-3">
                      <div className="gs-caption">登录管理</div>
                      {loginError && (
                        <div className="gs-caption" style={{ color: 'var(--gs-error)' }}>
                          {loginError}
                        </div>
                      )}
                      {showPasskeyLogin && (
                        <button
                          type="button"
                          className="btn-secondary w-full text-xs"
                          disabled={passkeyLoading}
                          onClick={loginPasskey}
                        >
                          <i className="fas fa-fingerprint" />
                          {passkeyLoading ? '验证中...' : '使用 Passkey'}
                        </button>
                      )}
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && login()}
                        className="input-field w-full px-4 py-2 text-sm"
                        placeholder={
                          settings?.has_admin_password ? '输入管理密码' : '无需密码，回车进入'
                        }
                      />
                      <div className="flex items-center gap-2">
                        <button type="button" className="btn-primary flex-1" onClick={login}>
                          登录
                        </button>
                        <button type="button" className="btn-ghost" onClick={() => setShowLogin(false)}>
                          取消
                        </button>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    className="btn-icon footer-icon-link"
                    title="登录"
                    onClick={() => setShowLogin(!showLogin)}
                  >
                    <i className="fas fa-lock" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
