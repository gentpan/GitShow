import { Link, useRouterState } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import { adminAuth, passkey } from '@/lib/auth'
import { darkenColor, themeMap } from '@/lib/utils'

const baseNavLinks = [
  { path: '/', label: '主页', icon: 'fas fa-house' },
  { path: '/projects', label: '项目', icon: 'fas fa-folder' },
  { path: '/following', label: '关注', icon: 'fas fa-user-plus' },
  { path: '/activity', label: '看板', icon: 'fas fa-chart-bar' },
]

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [settings, setSettings] = useState<any>(null)
  const [me, setMe] = useState<any>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [navHidden, setNavHidden] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [passkeyLoading, setPasskeyLoading] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => {})
    api.getMe().then(setMe).catch(() => {})
    setLoggedIn(adminAuth.isLoggedIn() || pathname === '/admin')
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
    if (loggedIn || pathname === '/admin') links.push({ path: '/admin', label: '管理', icon: 'fas fa-gear' })
    return links
  }, [loggedIn, pathname])

  const rootStyle = {
    backgroundColor: '#000',
    ['--theme-primary' as string]: theme.primary,
    ['--theme-primary-rgb' as string]: theme.rgb,
    ['--theme-primary-dark' as string]: darkenColor(theme.primary),
  } as React.CSSProperties

  const contactUrl = settings?.contact_url || me?.user?.html_url || 'https://github.com'

  async function login() {
    try {
      await api.adminLogin(password)
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

  return (
    <div className="min-h-screen flex flex-col" style={rootStyle}>
      <div className={`nav-shell sticky top-4 z-50 px-4 ${navHidden && !mobileOpen ? 'nav-shell-hidden' : ''}`}>
        <div className="nav-capsule themed-nav max-w-5xl mx-auto flex items-center justify-between px-2 py-2">
          <Link to="/" className="flex items-center gap-2 px-4 py-2" style={{ color: 'var(--theme-primary)', fontSize: 18, fontWeight: 700 }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            {settings?.title || 'GitShow'}
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className={`nav-pill nav-link flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${pathname === link.path ? 'nav-link-active' : ''}`}>
                <i className={`${link.icon} text-xs`} />{link.label}
              </Link>
            ))}
          </div>
          <a href={contactUrl} target="_blank" rel="noreferrer" className="nav-pill hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-medium" style={{ backgroundColor: 'var(--theme-primary)', color: '#000' }}>
            <i className="fas fa-paper-plane text-xs" />{settings?.contact_label || '联系'}
          </a>
          <button type="button" className="nav-pill nav-link sm:hidden flex items-center justify-center w-9 h-9" onClick={() => setMobileOpen(!mobileOpen)}>
            <i className={mobileOpen ? 'fas fa-xmark text-base' : 'fas fa-bars text-sm'} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-menu-panel sm:hidden px-4 pb-4 space-y-1">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} className={`nav-pill nav-link flex items-center gap-2 px-4 py-2.5 text-sm font-medium ${pathname === link.path ? 'nav-link-active' : ''}`} onClick={() => setMobileOpen(false)}>
              <i className={`${link.icon} text-xs w-4 text-center`} />{link.label}
            </Link>
          ))}
        </div>
      )}

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">{children}</main>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm flex flex-wrap items-center justify-center gap-1.5" style={{ color: '#52525b' }}>
            <span>© {new Date().getFullYear()} {settings?.title || 'GitShow'}</span>
            <span>build with</span>
            <a href="https://github.com/gentpan/GitShow" target="_blank" rel="noreferrer" style={{ color: '#a1a1aa' }}>GitShow</a>
          </div>
          <div className="flex items-center gap-2">
            {(settings?.social_links || []).map((link: any, i: number) => (
              <a key={i} href={link.url} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center text-sm" style={{ color: '#52525b' }}><i className={link.icon} /></a>
            ))}
            {loggedIn ? (
              <button type="button" className="footer-logout-button w-8 h-8 flex items-center justify-center text-sm" title="退出登录" onClick={() => { adminAuth.logout(); setLoggedIn(false); if (pathname === '/admin') window.location.href = '/' }}>
                <i className="fas fa-right-from-bracket" />
              </button>
            ) : (
              <div className="relative">
                {showLogin && (
                  <div className="footer-login-popover absolute bottom-full right-0 mb-2 w-64 p-4 space-y-3">
                    <div className="text-xs" style={{ color: '#a1a1aa' }}>登录管理</div>
                    {loginError && <div className="text-xs" style={{ color: '#ef4444' }}>{loginError}</div>}
                    {settings?.has_passkey && passkey.isSupported() && (
                      <button type="button" className="w-full px-3 py-2 text-xs font-medium" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#fafafa', border: '1px solid rgba(255,255,255,0.12)' }} disabled={passkeyLoading} onClick={loginPasskey}>
                        <i className="fas fa-fingerprint mr-1" />{passkeyLoading ? '验证中...' : '使用 Passkey'}
                      </button>
                    )}
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && login()} className="w-full px-3 py-2 text-sm outline-none" style={{ backgroundColor: 'rgba(0,0,0,0.55)', color: '#fafafa', border: '1px solid rgba(255,255,255,0.12)' }} placeholder={settings?.has_admin_password ? '输入管理密码' : '无需密码，回车进入'} />
                    <div className="flex items-center gap-2">
                      <button type="button" className="flex-1 px-3 py-2 text-xs font-medium" style={{ backgroundColor: 'var(--theme-primary)', color: '#000' }} onClick={login}>登录</button>
                      <button type="button" className="px-3 py-2 text-xs" style={{ color: '#52525b' }} onClick={() => setShowLogin(false)}>取消</button>
                    </div>
                  </div>
                )}
                <button type="button" className="w-8 h-8 flex items-center justify-center text-sm" style={{ color: '#52525b' }} onClick={() => setShowLogin(!showLogin)}><i className="fas fa-lock" /></button>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
