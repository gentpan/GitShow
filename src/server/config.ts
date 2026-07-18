import { readFileSync, writeFileSync } from 'node:fs'
import type { Config, Settings, PublicSettings, PasskeyInfo, PasskeyRecord } from './types'
import { toSimpleWebAuthnCredential } from './passkeyCodec'

const CONFIG_PATH = process.env.CONFIG_PATH || 'config.json'
const SETTINGS_PATH = process.env.SETTINGS_PATH || 'settings.json'

let configCache: Config | null = null
let settingsCache: Settings | null = null

export function loadConfig(): Config {
  if (configCache) return configCache
  const raw = readFileSync(CONFIG_PATH, 'utf-8')
  const cfg = JSON.parse(raw) as Config
  const envToken = process.env.GITHUB_TOKEN
  if (envToken) cfg.token = envToken
  configCache = cfg
  return cfg
}

export function loadSettings(): Settings {
  if (settingsCache) return settingsCache
  try {
    const raw = readFileSync(SETTINGS_PATH, 'utf-8')
    const st = JSON.parse(raw) as Settings
    if (!st.title) st.title = 'GitShow'
    if (!st.homepage_repo_count) st.homepage_repo_count = 6
    settingsCache = st
    return st
  } catch {
    const defaults: Settings = {
      title: 'GitShow',
      github_username: '',
      github_url: '',
      github_token: '',
      contact_label: '联系',
      contact_url: '',
      homepage_repo_count: 6,
      homepage_repos: [],
      social_links: [],
      theme: 'blue',
      admin_password: '',
    }
    settingsCache = defaults
    return defaults
  }
}

export function saveSettings(st: Settings): void {
  writeFileSync(SETTINGS_PATH, JSON.stringify(st, null, 2), 'utf-8')
  settingsCache = st
}

export function reloadSettings(): Settings {
  settingsCache = null
  return loadSettings()
}

export function getUsername(): string {
  const st = loadSettings()
  const cfg = loadConfig()
  return st.github_username || cfg.username
}

export function getGitHubUrl(): string {
  const st = loadSettings()
  const cfg = loadConfig()
  return st.github_url || `https://github.com/${cfg.username}`
}

export function getToken(): string {
  const st = loadSettings()
  const cfg = loadConfig()
  return st.github_token || cfg.token
}

export function getPublicSettings(): PublicSettings {
  const st = loadSettings()
  return {
    title: st.title,
    github_username: st.github_username,
    github_url: st.github_url,
    contact_label: st.contact_label,
    contact_url: st.contact_url,
    homepage_repo_count: st.homepage_repo_count,
    homepage_repos: st.homepage_repos,
    social_links: st.social_links,
    theme: st.theme,
    has_admin_password: Boolean(st.admin_password),
    has_github_token: Boolean(st.github_token),
    has_passkey: hasPasskeys(st),
  }
}

export function normalizePasskeyNote(note: string): string {
  const trimmed = note.trim()
  if (!trimmed) return 'Passkey'
  return [...trimmed].slice(0, 60).join('')
}

export function passkeyInfos(st: Settings): PasskeyInfo[] {
  const items: PasskeyInfo[] = []
  const seen = new Set<string>()
  for (const pk of st.passkeys || []) {
    const id = pk.id
    if (!id || seen.has(id)) continue
    seen.add(id)
    items.push({
      id,
      note: normalizePasskeyNote(pk.note),
      created_at: pk.created_at,
      last_used_at: pk.last_used_at,
    })
  }
  for (let i = 0; i < (st.passkey_credentials || []).length; i++) {
    const normalized = toSimpleWebAuthnCredential(st.passkey_credentials![i])
    const id = normalized?.id || ''
    if (!id || seen.has(id)) continue
    seen.add(id)
    items.push({ id, note: `旧 Passkey ${i + 1}` })
  }
  return items
}

export function hasPasskeys(st: Settings): boolean {
  return (st.passkeys?.length || 0) > 0 || (st.passkey_credentials?.length || 0) > 0
}

export function validateAdminPassword(password: string): boolean {
  const st = loadSettings()
  if (!st.admin_password) return true
  return st.admin_password === password
}

export function requireAdmin(headers: Headers): boolean {
  const password = headers.get('x-admin-password') || ''
  return validateAdminPassword(password)
}

export { type PasskeyRecord }
