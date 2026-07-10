const API_BASE = '/api'

async function fetchJson<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, opts)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json() as Promise<T>
}

const adminHeaders = (password: string) => ({
  'Content-Type': 'application/json',
  'X-Admin-Password': password,
})

export const api = {
  getMe: () => fetchJson<any>('/me'),
  getRepos: () => fetchJson<any[]>('/repos'),
  getActivity: (username?: string, limit?: number) => {
    const params = new URLSearchParams()
    if (username) params.set('username', username)
    if (limit) params.set('limit', String(limit))
    return fetchJson<any[]>(`/activity?${params}`)
  },
  getFollowing: () => fetchJson<any[]>('/following'),
  getFeed: (limit?: number) => {
    const params = new URLSearchParams()
    if (limit) params.set('limit', String(limit))
    return fetchJson<any[]>(`/feed?${params}`)
  },
  getHeatmap: () => fetchJson<any[]>('/heatmap'),
  getStats: () => fetchJson<any>('/stats'),
  getStarHistory: () => fetchJson<any[]>('/stars-history'),
  getHealth: () => fetchJson<any>('/health'),
  getSettings: () => fetchJson<any>('/settings'),
  adminLogin: (password: string) =>
    fetchJson<any>('/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }),
  passkeyRegisterStart: () =>
    fetchJson<any>('/passkey/register/start', { method: 'POST' }),
  passkeyRegisterFinish: (sessionId: string, credential: unknown, note = '') =>
    fetchJson<any>(
      `/passkey/register/finish?session_id=${encodeURIComponent(sessionId)}&note=${encodeURIComponent(note)}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credential) },
    ),
  passkeyLoginStart: () => fetchJson<any>('/passkey/login/start', { method: 'POST' }),
  passkeyLoginFinish: (sessionId: string, credential: unknown) =>
    fetchJson<any>(`/passkey/login/finish?session_id=${encodeURIComponent(sessionId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credential),
    }),
  passkeyReset: () => fetchJson<any>('/passkey/reset', { method: 'POST' }),
  passkeyUpdate: (id: string, note: string) =>
    fetchJson<any>(`/passkey/update?id=${encodeURIComponent(id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    }),
  passkeyDelete: (id: string) =>
    fetchJson<any>(`/passkey/delete?id=${encodeURIComponent(id)}`, { method: 'POST' }),
  getAdminSettings: (password: string) =>
    fetchJson<any>('/admin/settings', { headers: { 'X-Admin-Password': password } }),
  saveSettings: (settings: unknown, password = '') =>
    fetchJson<any>('/admin/settings', {
      method: 'POST',
      headers: adminHeaders(password),
      body: JSON.stringify(settings),
    }),
  refreshCache: () => fetchJson<any>('/refresh', { method: 'POST' }),
}
