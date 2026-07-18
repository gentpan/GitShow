import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
} from 'node:fs'
import { join, extname } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

const AVATAR_DIR = process.env.AVATARS_PATH || 'data/avatars'
/** Avatars rarely change; refresh at most once every 7 days. */
export const AVATAR_TTL_MS = 7 * 24 * 60 * 60 * 1000

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

function sanitizeLogin(login: string): string {
  return (login || 'unknown').toLowerCase().replace(/[^a-z0-9._-]/g, '_')
}

function ensureDir() {
  if (!existsSync(AVATAR_DIR)) mkdirSync(AVATAR_DIR, { recursive: true })
}

function findCachedFile(safe: string): string | null {
  if (!existsSync(AVATAR_DIR)) return null
  const match = readdirSync(AVATAR_DIR).find(
    (f) => f === safe || f.startsWith(`${safe}.`),
  )
  return match ? join(AVATAR_DIR, match) : null
}

function isFresh(path: string): boolean {
  try {
    const age = Date.now() - statSync(path).mtimeMs
    return age < AVATAR_TTL_MS
  } catch {
    return false
  }
}

/** Public URL path served by Caddy / Node static handler. */
export function localAvatarUrl(login: string): string {
  const safe = sanitizeLogin(login)
  const cached = findCachedFile(safe)
  if (cached) {
    const base = cached.split(/[/\\]/).pop() || `${safe}.jpg`
    return `/avatars/${base}`
  }
  return `/avatars/${safe}.jpg`
}

export function resolveAvatarUrl(login: string, remoteUrl?: string | null): string {
  const local = localAvatarUrl(login)
  const safe = sanitizeLogin(login)
  if (findCachedFile(safe)) return local
  return remoteUrl || local
}

/**
 * Download avatar to data/avatars if missing or older than TTL.
 * Returns the public /avatars/... URL.
 */
export async function ensureAvatar(
  login: string,
  remoteUrl?: string | null,
): Promise<string> {
  const safe = sanitizeLogin(login)
  ensureDir()
  const cached = findCachedFile(safe)
  if (cached && isFresh(cached)) {
    return localAvatarUrl(login)
  }
  if (!remoteUrl) {
    return cached ? localAvatarUrl(login) : ''
  }

  try {
    const res = await fetch(remoteUrl, {
      headers: { 'User-Agent': 'GitShow-AvatarCache' },
      redirect: 'follow',
    })
    if (!res.ok || !res.body) {
      return cached ? localAvatarUrl(login) : remoteUrl
    }
    const type = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
    const ext = EXT_BY_TYPE[type] || extname(new URL(remoteUrl).pathname).replace('.', '') || 'jpg'
    const filename = `${safe}.${ext}`
    const dest = join(AVATAR_DIR, filename)

    // Remove older extensions for the same login.
    for (const f of readdirSync(AVATAR_DIR)) {
      if (f !== filename && (f === safe || f.startsWith(`${safe}.`))) {
        try {
          unlinkSync(join(AVATAR_DIR, f))
        } catch {
          /* ignore */
        }
      }
    }

    await pipeline(Readable.fromWeb(res.body as any), createWriteStream(dest))
    return `/avatars/${filename}`
  } catch (err) {
    console.error(`[avatar] ${login}:`, err)
    return cached ? localAvatarUrl(login) : remoteUrl || ''
  }
}

export async function ensureAvatars(
  entries: Array<{ login: string; avatar_url?: string | null }>,
): Promise<void> {
  const uniq = new Map<string, string | null | undefined>()
  for (const e of entries) {
    if (!e?.login) continue
    if (!uniq.has(e.login)) uniq.set(e.login, e.avatar_url)
  }
  await Promise.all(
    [...uniq.entries()].map(([login, url]) => ensureAvatar(login, url).catch(() => '')),
  )
}
