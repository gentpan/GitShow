import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { passkey } from '@/lib/auth'
import { langColor, themeLabels, themeMap, timeAgo } from '@/lib/utils'
import {
  getRepos,
  getHealth,
  getAdminSettings,
  saveSettingsFn,
  refreshCacheFn,
  passkeyRegisterStartFn,
  passkeyRegisterFinishFn,
  passkeyResetFn,
  passkeyUpdateFn,
  passkeyDeleteFn,
} from '@/server/api'

export const Route = createFileRoute('/admin')({ component: AdminPage })

const COUNT_OPTIONS = [4, 6, 8, 10]

function AdminPage() {
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [passkeyBusy, setPasskeyBusy] = useState(false)
  const [passkeyMsg, setPasskeyMsg] = useState('')
  const [passkeyErr, setPasskeyErr] = useState(false)
  const [newPasskeyNote, setNewPasskeyNote] = useState('')
  const [passkeyNotes, setPasskeyNotes] = useState<Record<string, string>>({})
  const [origToken, setOrigToken] = useState('')
  const [origPassword, setOrigPassword] = useState('')
  const [githubTokenDirty, setGithubTokenDirty] = useState(false)
  const [adminPasswordDirty, setAdminPasswordDirty] = useState(false)

  const { data: settings, isPending: settingsPending, refetch: refetchSettings } = useQuery({
    queryKey: ['adminSettings'],
    queryFn: () => getAdminSettings(),
  })
  const { data: repos, isPending: reposPending } = useQuery({
    queryKey: ['repos'],
    queryFn: () => getRepos(),
  })
  const { data: health, isPending: healthPending } = useQuery({
    queryKey: ['health'],
    queryFn: () => getHealth(),
  })

  const pending = settingsPending || reposPending || healthPending

  const c = (themeMap[(form.theme as keyof typeof themeMap) || 'green'] || themeMap.green).primary
  const passkeyItems = settings?.passkey_items || []
  const hasPasskey = Boolean(settings?.has_passkey || passkeyItems.length)
  const githubUsername = form.github_username || ''
  const configUsername = useMemo(() => {
    try {
      const m = String(form.github_url || '').match(/github\.com\/([^/]+)/)
      return m?.[1] || form.github_username || ''
    } catch { return form.github_username || '' }
  }, [form.github_url, form.github_username])

  const applySettings = useCallback((st: any) => {
    if (!st) return
    setOrigToken(st.github_token || '')
    setOrigPassword(st.admin_password || '')
    setForm({
      title: st.title || 'GitShow',
      github_username: st.github_username || '',
      github_url: st.github_url || '',
      github_token: githubTokenDirty ? form.github_token : '',
      contact_label: st.contact_label || '',
      contact_url: st.contact_url || '',
      homepage_repo_count: st.homepage_repo_count || 6,
      homepage_repos: st.homepage_repos || [],
      social_links: st.social_links || [],
      theme: st.theme || 'green',
      admin_password: adminPasswordDirty ? form.admin_password : '',
    })
    const notes: Record<string, string> = {}
    for (const item of st.passkey_items || []) notes[item.id] = item.note || ''
    setPasskeyNotes(notes)
  }, [adminPasswordDirty, form.admin_password, form.github_token, githubTokenDirty])

  useEffect(() => {
    applySettings(settings)
  }, [settings, applySettings])

  const isSelected = (name: string) => (form.homepage_repos || []).includes(name)
  const allSelected = repos && repos.length > 0 && repos.every((r: any) => isSelected(r.name))

  const toggleRepo = (name: string) => {
    setForm((f: any) => ({
      ...f,
      homepage_repos: isSelected(name)
        ? f.homepage_repos.filter((n: string) => n !== name)
        : [...f.homepage_repos, name],
    }))
  }

  const toggleAll = () => {
    setForm((f: any) => ({
      ...f,
      homepage_repos: allSelected ? [] : repos?.map((r: any) => r.name),
    }))
  }

  const addSocialLink = () => {
    setForm((f: any) => ({
      ...f,
      social_links: [...(f.social_links || []), { icon: 'fab fa-github', url: '' }],
    }))
  }

  const removeSocialLink = (i: number) => {
    setForm((f: any) => ({
      ...f,
      social_links: f.social_links.filter((_: unknown, idx: number) => idx !== i),
    }))
  }

  const onGithubUrlBlur = () => {
    const match = String(form.github_url || '').match(/github\.com\/([^/]+)/)
    if (match) setForm((f: any) => ({ ...f, github_username: match[1] }))
  }

  const save = async () => {
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      await saveSettingsFn({ data: {
        title: form.title,
        github_username: configUsername || form.github_username,
        github_url: form.github_url,
        github_token: githubTokenDirty ? form.github_token : origToken,
        contact_label: form.contact_label,
        contact_url: form.contact_url,
        homepage_repo_count: form.homepage_repo_count,
        homepage_repos: form.homepage_repos,
        social_links: form.social_links,
        theme: form.theme,
        admin_password: adminPasswordDirty ? form.admin_password : origPassword,
      } })
      setGithubTokenDirty(false)
      setAdminPasswordDirty(false)
      setSaved(true)
      await refetchSettings()
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
      await refreshCacheFn()
      await refetchSettings()
    } finally {
      setRefreshing(false)
    }
  }

  if (pending) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="loading-spinner w-8 h-8 border-2 animate-spin" style={{ borderColor: c, borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold" style={{ color: '#fafafa' }}>管理设置</h1>

      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: '#a1a1aa' }}>最后刷新</span>
          <span className="text-sm" style={{ color: '#52525b' }}>{health?.last_updated ? timeAgo(health.last_updated) : '—'}</span>
        </div>
        <button type="button" className="px-4 py-2 text-sm" style={{ backgroundColor: '#111', color: '#a1a1aa', border: '1px solid rgba(255,255,255,0.1)' }} disabled={refreshing} onClick={refresh}>
          {refreshing ? '刷新中...' : '刷新数据'}
        </button>
      </div>

      <div className="space-y-6">
        <section className="gs-card p-6">
          <h2 className="text-sm font-medium mb-4" style={{ color: 'var(--gs-text-secondary)' }}>网站标题</h2>
          <input value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field w-full px-4 py-3 text-base" placeholder="GitShow" />
        </section>

        <section className="gs-card p-6 space-y-3">
          <h2 className="text-sm font-medium" style={{ color: 'var(--gs-text-secondary)' }}>主题色</h2>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(themeMap) as Array<keyof typeof themeMap>).map((key) => (
              <button
                key={key}
                type="button"
                className={`px-4 py-2 text-sm font-medium ${form.theme === key ? 'active-count' : 'inactive-count'}`}
                onClick={() => setForm({ ...form, theme: key })}
                style={
                  form.theme === key
                    ? { backgroundColor: themeMap[key].primary, borderColor: themeMap[key].primary, color: '#fff' }
                    : { borderColor: themeMap[key].primary, color: themeMap[key].primary }
                }
              >
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full mr-2"
                  style={{ backgroundColor: themeMap[key].primary }}
                  aria-hidden
                />
                {themeLabels[key]}
              </button>
            ))}
          </div>
        </section>

        <section className="gs-card p-6 space-y-4">
          <h2 className="text-sm font-medium" style={{ color: 'var(--gs-text-secondary)' }}>GitHub 账号</h2>
          <div>
            <label className="block text-xs mb-1" style={{ color: '#52525b' }}>GitHub 地址</label>
            <input value={form.github_url || ''} onChange={(e) => setForm({ ...form, github_url: e.target.value })} onBlur={onGithubUrlBlur} className="input-field w-full px-4 py-3 text-sm" placeholder="https://github.com/gentpan" />
          </div>
          {configUsername && (
            <div className="text-xs" style={{ color: '#52525b' }}>识别用户: <span style={{ color: c }}>{configUsername}</span></div>
          )}
          <div>
            <label className="block text-xs mb-1" style={{ color: '#52525b' }}>GitHub Token (ghp_xxx)</label>
            <input type="password" value={form.github_token || ''} onChange={(e) => { setForm({ ...form, github_token: e.target.value }); setGithubTokenDirty(true) }} className="input-field w-full px-4 py-3 text-sm" placeholder={origToken ? '已设置，留空保持不变' : 'ghp_xxx'} autoComplete="new-password" />
          </div>
        </section>

        <section className="gs-card p-6 space-y-4">
          <h2 className="text-sm font-medium" style={{ color: '#a1a1aa' }}>右上角联系按钮</h2>
          <input value={form.contact_label || ''} onChange={(e) => setForm({ ...form, contact_label: e.target.value })} className="input-field w-full px-4 py-3 text-sm" placeholder="联系" />
          <input value={form.contact_url || ''} onChange={(e) => setForm({ ...form, contact_url: e.target.value })} className="input-field w-full px-4 py-3 text-sm" placeholder="https://github.com/your-name" />
        </section>

        <section className="gs-card p-6">
          <h2 className="text-sm font-medium mb-4" style={{ color: '#a1a1aa' }}>首页项目显示数量</h2>
          <div className="flex gap-3">
            {COUNT_OPTIONS.map((n) => (
              <button key={n} type="button" className={`px-5 py-2 text-sm font-medium ${form.homepage_repo_count === n ? 'active-count' : 'inactive-count'}`} onClick={() => setForm({ ...form, homepage_repo_count: n })}>{n}</button>
            ))}
          </div>
        </section>

        <section className="gs-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium" style={{ color: '#a1a1aa' }}>社交链接 (Icon 按钮)</h2>
            <button type="button" className="text-xs flex items-center gap-1" style={{ color: 'var(--theme-primary)' }} onClick={addSocialLink}><i className="fas fa-plus" /> 添加</button>
          </div>
          <div className="space-y-3">
            {(form.social_links || []).map((link: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3" style={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <i className={link.icon || 'fas fa-link'} style={{ color: '#a1a1aa', fontSize: 12 }} />
                </div>
                <input value={link.icon || ''} onChange={(e) => { const links = [...form.social_links]; links[i] = { ...links[i], icon: e.target.value }; setForm({ ...form, social_links: links }) }} className="w-28 shrink-0 px-3 py-2 text-sm outline-none" style={{ backgroundColor: '#111', color: '#fafafa', border: '1px solid rgba(255,255,255,0.1)' }} placeholder="fab fa-github" />
                <input value={link.url || ''} onChange={(e) => { const links = [...form.social_links]; links[i] = { ...links[i], url: e.target.value }; setForm({ ...form, social_links: links }) }} className="flex-1 min-w-0 px-3 py-2 text-sm outline-none" style={{ backgroundColor: '#111', color: '#fafafa', border: '1px solid rgba(255,255,255,0.1)' }} placeholder="https://..." />
                <button type="button" className="w-8 h-8 flex items-center justify-center shrink-0" style={{ color: '#a1a1aa' }} onClick={() => removeSocialLink(i)}><i className="fas fa-trash text-xs" /></button>
              </div>
            ))}
            {!form.social_links?.length && <div className="text-xs py-2" style={{ color: '#a1a1aa' }}>暂无社交链接</div>}
          </div>
        </section>

        <section className="gs-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium" style={{ color: '#a1a1aa' }}>项目管理</h2>
            <button type="button" className="text-xs" style={{ color: 'var(--theme-primary)' }} onClick={toggleAll}>{allSelected ? '取消全选' : '全选'}</button>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {repos?.map((repo: any) => (
              <div key={repo.id} className="repo-row flex items-center justify-between px-4 py-3 cursor-pointer" onClick={() => toggleRepo(repo.name)}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2 h-2 shrink-0" style={{ backgroundColor: repo.language ? langColor(repo.language) : '#52525b' }} />
                  <span className="text-sm truncate" style={{ color: '#fafafa' }}>{repo.name}</span>
                  {repo.full_name && repo.full_name.split('/')[0] !== githubUsername && (
                    <span className="text-[10px] px-1 py-0.5 shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#a1a1aa' }}>{repo.full_name.split('/')[0]}</span>
                  )}
                  <span className="text-xs shrink-0" style={{ color: '#a1a1aa' }}>{repo.stargazers_count} ★</span>
                </div>
                <div className={`w-10 h-5 shrink-0 relative toggle-bg ${isSelected(repo.name) ? 'toggle-on' : 'toggle-off'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 toggle-knob ${isSelected(repo.name) ? 'knob-on' : 'knob-off'}`} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="gs-card p-6">
          <h2 className="text-sm font-medium mb-4" style={{ color: '#a1a1aa' }}>管理密码</h2>
          <div className="flex gap-3 items-center">
            <input type="password" value={form.admin_password || ''} onChange={(e) => { setForm({ ...form, admin_password: e.target.value }); setAdminPasswordDirty(true) }} className="input-field flex-1 px-4 py-3 text-sm" placeholder={origPassword ? '已设置，留空保持不变' : '设置管理密码，留空则无需密码'} autoComplete="new-password" />
            <span className="text-xs shrink-0" style={{ color: '#52525b' }}>已设置时留空保持不变</span>
          </div>
        </section>

        <section className="gs-card p-6">
          <h2 className="text-sm font-medium mb-2" style={{ color: '#a1a1aa' }}>Passkey</h2>
          <div className="text-xs mb-4" style={{ color: '#52525b' }}>
            {hasPasskey ? `已启用 ${passkeyItems.length} 个 Passkey，可用于无密码登录。` : '未设置，建议添加一个无密码登录方式。'}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input value={newPasskeyNote} onChange={(e) => setNewPasskeyNote(e.target.value)} maxLength={60} className="flex-1 px-4 py-2 text-sm outline-none" style={{ backgroundColor: '#111', color: '#fafafa', border: '1px solid rgba(255,255,255,0.1)' }} placeholder="备注，例如 MacBook、iPhone" />
            <button type="button" className="px-4 py-2 text-sm font-medium shrink-0 btn-save" disabled={passkeyBusy || !passkey.isSupported()} onClick={async () => {
              setPasskeyBusy(true); setPasskeyMsg(''); setPasskeyErr(false)
              try {
                const start = await passkeyRegisterStartFn()
                const credential = await navigator.credentials.create({
                  publicKey: passkey.prepareCreationOptions(start.options),
                })
                if (!credential) throw new Error('passkey registration cancelled')
                await passkeyRegisterFinishFn({ data: {
                  sessionId: start.session_id,
                  credential: passkey.credentialToJSON(credential as PublicKeyCredential),
                  note: newPasskeyNote,
                } })
                setNewPasskeyNote('')
                setPasskeyMsg('Passkey 已添加')
                await refetchSettings()
              } catch { setPasskeyErr(true); setPasskeyMsg('Passkey 添加失败') }
              finally { setPasskeyBusy(false) }
            }}>
              <i className="fas fa-fingerprint mr-1" />{passkeyBusy ? '处理中...' : '添加 Passkey'}
            </button>
          </div>
          {passkeyItems.map((item: any) => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 mb-2" style={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex-1 min-w-0">
                <input value={passkeyNotes[item.id] ?? item.note ?? ''} onChange={(e) => setPasskeyNotes({ ...passkeyNotes, [item.id]: e.target.value })} maxLength={60} className="w-full px-3 py-2 text-sm outline-none" style={{ backgroundColor: '#111', color: '#fafafa', border: '1px solid rgba(255,255,255,0.1)' }} />
                <div className="text-[10px] mt-1 truncate" style={{ color: '#52525b' }}>
                  {item.created_at ? `创建 ${timeAgo(item.created_at)}` : '旧版 Passkey'}
                  {item.last_used_at ? ` · 最近使用 ${timeAgo(item.last_used_at)}` : ''}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button type="button" className="px-3 py-2 text-xs" style={{ backgroundColor: '#111', color: '#a1a1aa', border: '1px solid rgba(255,255,255,0.1)' }} disabled={passkeyBusy} onClick={async () => {
                  setPasskeyBusy(true)
                  try { await passkeyUpdateFn({ data: { id: item.id, note: passkeyNotes[item.id] ?? item.note ?? '' } }); setPasskeyMsg('Passkey 备注已保存'); await refetchSettings() }
                  catch { setPasskeyErr(true); setPasskeyMsg('备注保存失败') }
                  finally { setPasskeyBusy(false) }
                }}>保存备注</button>
                <button type="button" className="px-3 py-2 text-xs" style={{ backgroundColor: '#111', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }} disabled={passkeyBusy} onClick={async () => {
                  if (!confirm(`删除 Passkey「${item.note || 'Passkey'}」？`)) return
                  setPasskeyBusy(true)
                  try { await passkeyDeleteFn({ data: { id: item.id } }); setPasskeyMsg('Passkey 已删除'); await refetchSettings() }
                  catch { setPasskeyErr(true); setPasskeyMsg('删除失败') }
                  finally { setPasskeyBusy(false) }
                }}>删除</button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between gap-3 mt-2">
            {!passkey.isSupported() ? (
              <div className="text-xs" style={{ color: '#ef4444' }}>当前浏览器或访问地址不支持 Passkey，请使用 localhost 或 HTTPS。</div>
            ) : (
              <div className="text-xs" style={{ color: '#52525b' }}>不同域名需要分别设置 Passkey。</div>
            )}
            {hasPasskey && (
              <button type="button" className="px-3 py-2 text-xs shrink-0" style={{ backgroundColor: '#111', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }} disabled={passkeyBusy} onClick={async () => {
                if (!confirm('确定清除全部 Passkey？')) return
                setPasskeyBusy(true)
                try { await passkeyResetFn(); setPasskeyMsg('Passkey 已清除'); await refetchSettings() }
                catch { setPasskeyErr(true); setPasskeyMsg('清除失败') }
                finally { setPasskeyBusy(false) }
              }}>清除全部</button>
            )}
          </div>
          {passkeyMsg && <div className="mt-3 text-xs" style={{ color: passkeyErr ? 'var(--gs-error)' : 'var(--theme-primary)' }}>{passkeyMsg}</div>}
        </section>

        <div className="flex items-center gap-4">
          <button type="button" className="btn-save px-8 h-12 text-base font-semibold" disabled={saving} onClick={save}>{saving ? '保存中...' : '保存设置'}</button>
          {saved && <span className="text-sm" style={{ color: 'var(--theme-primary)' }}>✓ 已保存</span>}
          {error && <span className="text-sm" style={{ color: '#ef4444' }}>{error}</span>}
        </div>
      </div>
    </div>
  )
}
