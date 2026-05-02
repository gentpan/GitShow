const getBase = () => {
  const config = useRuntimeConfig()
  // Server-side requests go through internal Docker network
  if (process.server) {
    return config.apiBase as string
  }
  // Client-side requests go through host port mapping
  return config.public.apiBase as string
}

export const useApi = () => {
  const base = getBase()

  const fetchJson = async <T>(path: string, opts?: RequestInit): Promise<T> => {
    const res = await fetch(`${base}${path}`, opts)
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return res.json()
  }

  const adminHeaders = (password: string) => ({
    'Content-Type': 'application/json',
    'X-Admin-Password': password,
  })

  return {
    getMe: () => fetchJson<any>('/api/me'),
    getRepos: () => fetchJson<any[]>('/api/repos'),
    getActivity: (username?: string, limit?: number) => {
      const params = new URLSearchParams()
      if (username) params.set('username', username)
      if (limit) params.set('limit', String(limit))
      return fetchJson<any[]>(`/api/activity?${params}`)
    },
    getFollowing: () => fetchJson<any[]>('/api/following'),
    getFeed: (limit?: number) => {
      const params = new URLSearchParams()
      if (limit) params.set('limit', String(limit))
      return fetchJson<any[]>(`/api/feed?${params}`)
    },
    getHeatmap: () => fetchJson<any[]>('/api/heatmap'),
    getStats: () => fetchJson<any>('/api/stats'),
    getStarHistory: () => fetchJson<any[]>('/api/stars-history'),
    getHealth: () => fetchJson<any>('/api/health'),
    getSettings: () => fetchJson<any>('/api/settings'),
    adminLogin: (password: string) => fetchJson<any>('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }),
    passkeyRegisterStart: () => fetchJson<any>('/api/passkey/register/start', {
      method: 'POST',
    }),
    passkeyRegisterFinish: (sessionId: string, credential: any, note = '') => fetchJson<any>(`/api/passkey/register/finish?session_id=${encodeURIComponent(sessionId)}&note=${encodeURIComponent(note)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credential),
    }),
    passkeyLoginStart: () => fetchJson<any>('/api/passkey/login/start', {
      method: 'POST',
    }),
    passkeyLoginFinish: (sessionId: string, credential: any) => fetchJson<any>(`/api/passkey/login/finish?session_id=${encodeURIComponent(sessionId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credential),
    }),
    passkeyReset: () => fetchJson<any>('/api/passkey/reset', {
      method: 'POST',
    }),
    passkeyUpdate: (id: string, note: string) => fetchJson<any>(`/api/passkey/update?id=${encodeURIComponent(id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    }),
    passkeyDelete: (id: string) => fetchJson<any>(`/api/passkey/delete?id=${encodeURIComponent(id)}`, {
      method: 'POST',
    }),
    getAdminSettings: (password: string) => fetchJson<any>('/api/admin/settings', {
      headers: { 'X-Admin-Password': password },
    }),
    saveSettings: (settings: any, password = '') => fetchJson<any>('/api/admin/settings', {
      method: 'POST',
      headers: adminHeaders(password),
      body: JSON.stringify(settings),
    }),
    refreshCache: () => fetchJson<any>('/api/refresh'),
  }
}
