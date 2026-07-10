import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { adminAuth, passkey } from '@/lib/auth'
import { themeMap, timeAgo } from '@/lib/utils'

export const Route = createFileRoute('/admin')({ component: AdminPage })

function AdminPage() {
  const [settings, setSettings] = useState<any>(null)
  const [repos, setRepos] = useState<any[]>([])
  const [health, setHealth] = useState<any>(null)
  const [pending, setPending] = useState(true)
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [passkeyBusy, setPasskeyBusy] = useState(false)
  const [passkeyMsg, setPasskeyMsg] = useState('')
  const [newPasskeyNote, setNewPasskeyNote] = useState('')
  const [githubTokenDirty, setGithubTokenDirty] = useState(false)
  const [adminPasswordDirty, setAdminPasswordDirty] = useState(false)
  const [origToken, setOrigToken] = useState('')
  const [origPassword, setOrigPassword] = useState('')

  const c = (themeMap[(form.theme as keyof typeof themeMap) || 'green'] || themeMap.green).primary
  const password = adminAuth.getPassword()

  const load = async () => {
    adminAuth.login()
    const [st, rs, h] = await Promise.all([
      api.getAdminSettings(password),
      api.getRepos(),
      api.getHealth(),
    ])
    setSettings(st)
    setRepos(rs)
    setHealth(h)
    setOrigToken(st.github_token || '')
    setOrigPassword(st.admin_password || '')
    setForm({
      title: st.title || 'GitShow',
      github_username: st.github_username || '',
      github_url: st.github_url || '',
      github_token: '',
      contact_label: st.contact_label || '',
      contact_url: st.contact_url || '',
      homepage_repo_count: st.homepage_repo_count || 6,
      homepage_repos: st.homepage_repos || [],
      social_links: st.social_links || [],
      theme: st.theme || 'green',
      admin_password: '',
    })
    setPending(false)
  }

  useEffect(() => { load().catch(() => setPending(false)) }, [])

  const toggleRepo = (name: string) => {
    setForm((f: any) => ({
      ...f,
      homepage_repos: f.homepage_repos.includes(name)
        ? f.homepage_repos.filter((n: string) => n !== name)
        : [...f.homepage_repos, name],
    }))
  }

  const save = async () => {
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      await api.saveSettings({
        ...form,
        github_token: githubTokenDirty ? form.github_token : origToken,
        admin_password: adminPasswordDirty ? form.admin_password : origPassword,
      }, password)
      setSaved(true)
      await load()
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const refresh = async () => {
    setRefreshing(true)
    try {
      await api.refreshCache()
      await load()
    } finally {
      setRefreshing(false)
    }
  }

  if (pending) {
    return <div className="flex items-center justify-center py-20"><div className="loading-spinner w-8 h-8 border-2 animate-spin" style={{ borderColor: c, borderTopColor: 'transparent' }} /></div>
  }

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold" style={{ color: '#fafafa' }}>管理设置</h1>

      <div className="p-4 flex items-center justify-between" style={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
        <span className="text-sm" style={{ color: '#a1a1aa' }}>最后刷新: {health?.last_updated ? timeAgo(health.last_updated) : '—'}</span>
        <button type="button" className="px-4 py-2 text-sm" style={{ backgroundColor: '#111', color: '#a1a1aa', border: '1px solid rgba(255,255,255,0.1)' }} disabled={refreshing} onClick={refresh}>{refreshing ? '刷新中...' : '刷新数据'}</button>
      </div>

      <div className="p-6 space-y-4" style={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h2 className="text-sm font-medium" style={{ color: '#a1a1aa' }}>网站标题</h2>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 outline-none" style={{ backgroundColor: '#111', color: '#fafafa', border: '1px solid rgba(255,255,255,0.1)' }} />
      </div>

      <div className="p-6 space-y-4" style={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h2 className="text-sm font-medium" style={{ color: '#a1a1aa' }}>GitHub</h2>
        <input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} placeholder="GitHub 地址" className="w-full px-4 py-3 outline-none" style={{ backgroundColor: '#111', color: '#fafafa', border: '1px solid rgba(255,255,255,0.1)' }} />
        <input value={form.github_token} onChange={(e) => { setForm({ ...form, github_token: e.target.value }); setGithubTokenDirty(true) }} placeholder={origToken ? '留空保持不变' : 'GitHub Token'} className="w-full px-4 py-3 outline-none" style={{ backgroundColor: '#111', color: '#fafafa', border: '1px solid rgba(255,255,255,0.1)' }} />
      </div>

      <div className="p-6 space-y-4" style={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h2 className="text-sm font-medium" style={{ color: '#a1a1aa' }}>首页项目 ({form.homepage_repos.length})</h2>
        <div className="max-h-64 overflow-y-auto space-y-1">
          {repos.map((repo) => (
            <label key={repo.id} className="repo-row flex items-center gap-3 px-3 py-2 cursor-pointer">
              <input type="checkbox" checked={form.homepage_repos.includes(repo.name)} onChange={() => toggleRepo(repo.name)} />
              <span className="text-sm" style={{ color: '#fafafa' }}>{repo.full_name || repo.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-4" style={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h2 className="text-sm font-medium" style={{ color: '#a1a1aa' }}>Passkey</h2>
        {(settings?.passkey_items || []).map((item: any) => (
          <div key={item.id} className="flex items-center justify-between text-sm" style={{ color: '#a1a1aa' }}>
            <span>{item.note}</span>
            <button type="button" className="text-xs" style={{ color: '#ef4444' }} onClick={async () => { await api.passkeyDelete(item.id); await load() }}>删除</button>
          </div>
        ))}
        <input value={newPasskeyNote} onChange={(e) => setNewPasskeyNote(e.target.value)} placeholder="Passkey 备注" className="w-full px-3 py-2 text-sm outline-none" style={{ backgroundColor: '#111', color: '#fafafa', border: '1px solid rgba(255,255,255,0.1)' }} />
        <button type="button" disabled={passkeyBusy || !passkey.isSupported()} className="px-4 py-2 text-sm" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#fafafa', border: '1px solid rgba(255,255,255,0.12)' }} onClick={async () => {
          setPasskeyBusy(true)
          try {
            await passkey.registerPasskey(newPasskeyNote)
            setPasskeyMsg('Passkey 已添加')
            setNewPasskeyNote('')
            await load()
          } catch { setPasskeyMsg('添加失败') }
          finally { setPasskeyBusy(false) }
        }}>{passkeyBusy ? '注册中...' : '添加 Passkey'}</button>
        {passkeyMsg && <p className="text-xs" style={{ color: '#16a34a' }}>{passkeyMsg}</p>}
      </div>

      <div className="p-6 space-y-4" style={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h2 className="text-sm font-medium" style={{ color: '#a1a1aa' }}>管理密码</h2>
        <input type="password" value={form.admin_password} onChange={(e) => { setForm({ ...form, admin_password: e.target.value }); setAdminPasswordDirty(true) }} placeholder={origPassword ? '留空保持不变' : '设置密码'} className="w-full px-4 py-3 outline-none" style={{ backgroundColor: '#111', color: '#fafafa', border: '1px solid rgba(255,255,255,0.1)' }} />
      </div>

      <div className="flex items-center gap-4">
        <button type="button" className="btn-save px-6 py-3 text-sm font-medium" disabled={saving} onClick={save}>{saving ? '保存中...' : '保存设置'}</button>
        {saved && <span className="text-sm" style={{ color: '#16a34a' }}>✓ 已保存</span>}
        {error && <span className="text-sm" style={{ color: '#ef4444' }}>{error}</span>}
      </div>
    </div>
  )
}
