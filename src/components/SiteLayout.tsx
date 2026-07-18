import { Link, useRouterState } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSettings, getMe, adminLogin, getPageviews, recordPageview } from '@/server/api'
import { formatNumber, darkenColor, themeMap } from '@/lib/utils'
import { adminAuth, passkey } from '@/lib/auth'
import { useI18n, type MessageKey } from '@/lib/i18n'
import { GitShowFooterLogo } from '@/components/GitShowFooterLogo'
import { GitShowLogo } from '@/components/GitShowLogo'
import { GitShowMark } from '@/components/GitShowMark'
import { LatticeCross } from '@/components/LatticeCross'

const baseNavKeys: { path: string; key: MessageKey; icon: string }[] = [
  { path: '/', key: 'nav.home', icon: 'fas fa-house' },
  { path: '/projects', key: 'nav.projects', icon: 'fas fa-folder' },
  { path: '/following', key: 'nav.following', icon: 'fas fa-user-plus' },
  { path: '/activity', key: 'nav.activity', icon: 'fas fa-chart-bar' },
]

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const { t, locale, setLocale } = useI18n()
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
  const { data: pageviews, refetch: refetchPageviews } = useQuery({
    queryKey: ['pageviews'],
    queryFn: () => getPageviews(),
    staleTime: 60_000,
  })

  useEffect(() => {
    setLoggedIn(adminAuth.isLoggedIn())
  }, [pathname])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const key = 'gitshow_pv_session'
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    recordPageview()
      .then(() => refetchPageviews())
      .catch(() => {})
  }, [refetchPageviews])

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
    const links = baseNavKeys.map((l) => ({ ...l, label: t(l.key) }))
    if (loggedIn) links.push({ path: '/admin', key: 'nav.admin', icon: 'fas fa-gear', label: t('nav.admin') })
    return links
  }, [loggedIn, t])

  const rootStyle = {
    ['--theme-primary' as string]: theme.primary,
    ['--theme-primary-rgb' as string]: theme.rgb,
    ['--theme-primary-dark' as string]: darkenColor(theme.primary),
    ['--home-accent' as string]: theme.primary,
  } as React.CSSProperties

  const contactUrl = settings?.contact_url || me?.user?.html_url || 'https://github.com'
  const brand = settings?.title || 'GitShow'
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
      setLoginError(t('login.errorPassword'))
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
      setLoginError(t('login.errorPasskey'))
    } finally {
      setPasskeyLoading(false)
    }
  }

  function isActive(path: string) {
    if (path === '/') return pathname === '/'
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  const langSwitch = (
    <div className="lang-switch" role="group" aria-label="Language">
      <button
        type="button"
        className={`lang-switch-btn${locale === 'zh' ? ' is-active' : ''}`}
        onClick={() => setLocale('zh')}
      >
        {t('nav.langZh')}
      </button>
      <button
        type="button"
        className={`lang-switch-btn${locale === 'en' ? ' is-active' : ''}`}
        onClick={() => setLocale('en')}
      >
        {t('nav.langEn')}
      </button>
    </div>
  )

  return (
    <div className="gs-shell" style={rootStyle}>
      <div className="gs-lattice">
        <LatticeCross position="tl" />
        <LatticeCross position="tr" />
        <LatticeCross position="bl" />
        <LatticeCross position="br" />
        <span className="gs-lattice-cross gs-lattice-cross-ml gs-lattice-header-mark" aria-hidden />
        <span className="gs-lattice-cross gs-lattice-cross-mr gs-lattice-header-mark" aria-hidden />

        <header className={`nav-shell ${navHidden && !mobileOpen ? 'nav-shell-hidden' : ''}`}>
          <div className="gs-container nav-bar">
            <Link to="/" className="nav-brand" activeProps={{ className: 'nav-brand' }} aria-label={brand}>
              <GitShowMark className="nav-brand-mark" title={brand} />
              <GitShowLogo className="nav-brand-logo" title={brand} />
            </Link>

            <nav className="nav-links hidden sm:flex" aria-label={t('nav.ariaMain')}>
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
              {langSwitch}
              <a href={contactUrl} target="_blank" rel="noreferrer" className="contact-btn">
                <i className="fas fa-paper-plane text-xs" />
                {settings?.contact_label || t('nav.contact')}
              </a>
            </div>

            <button
              type="button"
              className="btn-icon sm:hidden"
              aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.openMenu')}
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
                <div className="py-2">{langSwitch}</div>
                <a
                  href={contactUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="contact-btn w-full mt-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <i className="fas fa-paper-plane text-xs" />
                  {settings?.contact_label || t('nav.contact')}
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
              <span>{t('footer.poweredBy')}</span>
              <a
                href="https://github.com/gentpan/GitShow"
                target="_blank"
                rel="noreferrer"
                className="footer-gitshow-link"
                aria-label="GitShow"
              >
                <GitShowFooterLogo className="footer-gitshow-logo" />
              </a>
              <span>·</span>
              <span className="footer-pageviews" title={t('footer.pageviews')}>
                <i className="fas fa-eye" aria-hidden />
                {formatNumber(pageviews?.total || 0)}
              </span>
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
                  title={t('footer.logout')}
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
                      <div className="gs-caption">{t('login.title')}</div>
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
                          {passkeyLoading ? t('login.verifying') : t('login.passkey')}
                        </button>
                      )}
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && login()}
                        className="input-field w-full px-4 py-2 text-sm"
                        placeholder={
                          settings?.has_admin_password
                            ? t('login.passwordPlaceholder')
                            : t('login.noPasswordPlaceholder')
                        }
                      />
                      <div className="flex items-center gap-2">
                        <button type="button" className="btn-primary flex-1" onClick={login}>
                          {t('login.submit')}
                        </button>
                        <button type="button" className="btn-ghost" onClick={() => setShowLogin(false)}>
                          {t('login.cancel')}
                        </button>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    className="btn-icon footer-icon-link"
                    title={t('login.open')}
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
