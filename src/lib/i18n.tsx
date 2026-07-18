import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Locale = 'zh' | 'en'

const STORAGE_KEY = 'gitshow_locale'

const dict = {
  zh: {
    'nav.home': '主页',
    'nav.projects': '项目',
    'nav.following': '关注',
    'nav.activity': '看板',
    'nav.admin': '管理',
    'nav.ariaMain': '主导航',
    'nav.contact': '联系',
    'nav.openMenu': '打开菜单',
    'nav.closeMenu': '关闭菜单',
    'nav.langZh': '中文',
    'nav.langEn': 'EN',
    'footer.poweredBy': '基于',
    'footer.pageviews': '站点浏览量',
    'footer.logout': '退出登录',
    'login.title': '登录管理',
    'login.errorPassword': '密码错误',
    'login.errorPasskey': 'Passkey 验证失败',
    'login.passkey': '使用 Passkey',
    'login.verifying': '验证中...',
    'login.passwordPlaceholder': '输入管理密码',
    'login.noPasswordPlaceholder': '无需密码，回车进入',
    'login.submit': '登录',
    'login.cancel': '取消',
    'login.open': '登录',
    'common.loading': '加载中',
    'home.fallbackName': '开发者',
    'home.welcomeFallback': '开源贡献、技术栈与精选项目，记录持续构建的过程。',
    'home.welcomeTitle': '{name} 的开发者主页',
    'home.overview': '概览',
    'home.contributions': '贡献',
    'home.techStack': '技术栈与语言',
    'home.featured': '精选项目',
    'home.sortStars': '按 Star',
    'home.sortUpdated': '最近更新',
    'sidebar.followGithub': '在 GitHub 关注',
    'sidebar.followers': '关注者',
    'sidebar.following': '正在关注',
    'stats.repos': '公开仓库',
    'stats.stars': '获得 Star',
    'stats.followers': '关注者',
    'stats.years': '活跃年限',
    'contrib.empty': '暂无贡献数据',
    'contrib.summary': '近一年 {n} 次贡献',
    'contrib.weeks': '近 52 周活跃度',
    'contrib.less': '少',
    'contrib.more': '多',
    'tech.title': '核心技术',
    'tech.empty': '暂无语言数据',
    'lang.aria': '语言占比',
    'lang.center': '语言',
    'lang.empty': '暂无语言数据',
    'lang.footer': '基于 {bytes} 代码量 · Top 5',
    'external.title': '近期参与',
    'external.subtitle': '最近动态中对他人仓库的贡献',
    'external.prs': 'PR',
    'external.commits': '提交',
    'external.to': '参与 @{owner}',
    'project.noDescription': '该仓库暂无描述。',
    'projects.title': '所有项目',
    'projects.subtitle': '精选仓库与开源作品',
    'projects.empty': '后台未开启任何项目',
    'projects.count': '{n} 个仓库',
    'activity.title': '活动看板',
    'activity.subtitle': '最近的 GitHub 动态与贡献',
    'activity.empty': '该类型暂无动态',
    'activity.all': '全部',
    'activity.push': '提交',
    'activity.pr': 'PR',
    'activity.issue': 'Issue',
    'activity.create': '创建',
    'activity.star': 'Star',
    'activity.fork': 'Fork',
    'activity.release': '发布',
    'following.title': '关注的人',
    'following.subtitle': '追踪关注对象的活跃与项目',
    'following.empty': '暂无关注数据',
    'following.lastActive': '最近活跃：{time}',
    'following.noActivity': '近期无活动',
    'following.recentRepos': '最近仓库',
    'following.recentCommits': '最近提交',
    'tag.starAuthor': '高星作者',
    'tag.rising': '新锐项目',
    'tag.fullstack': '全栈',
    'tag.systems': '系统',
    'tag.mobile': '移动端',
    'tag.data': '数据',
    'tag.ops': '运维',
    'tag.active': '高活跃',
    'tag.consistent': '持续贡献',
    'tag.senior': '资深开发',
    'tag.polyglot': '多语言',
    'tag.influencer': '社区影响力',
    'tag.community': '社区成员',
  },
  en: {
    'nav.home': 'Home',
    'nav.projects': 'Projects',
    'nav.following': 'Following',
    'nav.activity': 'Activity',
    'nav.admin': 'Admin',
    'nav.ariaMain': 'Main navigation',
    'nav.contact': 'Contact',
    'nav.openMenu': 'Open menu',
    'nav.closeMenu': 'Close menu',
    'nav.langZh': '中文',
    'nav.langEn': 'EN',
    'footer.poweredBy': 'Built with',
    'footer.pageviews': 'Page views',
    'footer.logout': 'Log out',
    'login.title': 'Admin login',
    'login.errorPassword': 'Incorrect password',
    'login.errorPasskey': 'Passkey verification failed',
    'login.passkey': 'Use Passkey',
    'login.verifying': 'Verifying...',
    'login.passwordPlaceholder': 'Enter admin password',
    'login.noPasswordPlaceholder': 'No password — press Enter',
    'login.submit': 'Log in',
    'login.cancel': 'Cancel',
    'login.open': 'Log in',
    'common.loading': 'Loading',
    'home.fallbackName': 'Developer',
    'home.welcomeFallback': 'Open source work, tech stack, and featured projects.',
    'home.welcomeTitle': "{name}'s Developer Hub",
    'home.overview': 'Overview',
    'home.contributions': 'Contributions',
    'home.techStack': 'Tech Stack & Languages',
    'home.featured': 'Featured Projects',
    'home.sortStars': 'Most Stars',
    'home.sortUpdated': 'Recently Updated',
    'sidebar.followGithub': 'Follow on GitHub',
    'sidebar.followers': 'followers',
    'sidebar.following': 'following',
    'stats.repos': 'Public Repos',
    'stats.stars': 'Stars Earned',
    'stats.followers': 'Followers',
    'stats.years': 'Years Active',
    'contrib.empty': 'Contribution data not available',
    'contrib.summary': '{n} contributions in the last year',
    'contrib.weeks': 'Last 52 weeks of activity',
    'contrib.less': 'Less',
    'contrib.more': 'More',
    'tech.title': 'Core Technologies',
    'tech.empty': 'No language data available',
    'lang.aria': 'Language share',
    'lang.center': 'langs',
    'lang.empty': 'No language data available',
    'lang.footer': 'Based on {bytes} of code · Top 5',
    'external.title': 'Recent Participation',
    'external.subtitle': 'Contributions to others’ repositories in recent activity',
    'external.prs': 'PRs',
    'external.commits': 'commits',
    'external.to': 'Contributed to @{owner}',
    'project.noDescription': 'No description available for this repository.',
    'projects.title': 'All Projects',
    'projects.subtitle': 'Featured repositories and open source work',
    'projects.empty': 'No projects enabled in admin',
    'projects.count': '{n} repositories',
    'activity.title': 'Activity',
    'activity.subtitle': 'Recent GitHub activity and contributions',
    'activity.empty': 'No activity for this type',
    'activity.all': 'All',
    'activity.push': 'Push',
    'activity.pr': 'PR',
    'activity.issue': 'Issue',
    'activity.create': 'Create',
    'activity.star': 'Star',
    'activity.fork': 'Fork',
    'activity.release': 'Release',
    'following.title': 'Following',
    'following.subtitle': 'Track activity and projects from people you follow',
    'following.empty': 'No following data yet',
    'following.lastActive': 'Last active: {time}',
    'following.noActivity': 'No recent activity',
    'following.recentRepos': 'Recent repos',
    'following.recentCommits': 'Recent commits',
    'tag.starAuthor': 'Popular Creator',
    'tag.rising': 'Rising Star',
    'tag.fullstack': 'Full-Stack',
    'tag.systems': 'Systems',
    'tag.mobile': 'Mobile',
    'tag.data': 'Data',
    'tag.ops': 'DevOps',
    'tag.active': 'Highly Active',
    'tag.consistent': 'Consistent',
    'tag.senior': 'Veteran',
    'tag.polyglot': 'Polyglot',
    'tag.influencer': 'Influencer',
    'tag.community': 'Community Member',
  },
} as const

export type MessageKey = keyof typeof dict.zh

type Vars = Record<string, string | number>

function format(template: string, vars?: Vars): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ''))
}

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: MessageKey, vars?: Vars) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function readInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'zh'
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved === 'en' || saved === 'zh') return saved
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh')

  useEffect(() => {
    setLocaleState(readInitialLocale())
  }, [])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en'
    }
  }, [])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
    }
  }, [locale])

  const t = useCallback(
    (key: MessageKey, vars?: Vars) => format(dict[locale][key] || dict.zh[key] || key, vars),
    [locale],
  )

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
