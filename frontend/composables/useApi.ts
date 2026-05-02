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
    saveSettings: (settings: any) => fetchJson<any>('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    }),
    refreshCache: () => fetchJson<any>('/api/refresh'),
  }
}
