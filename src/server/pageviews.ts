import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const PAGEVIEWS_PATH = process.env.PAGEVIEWS_PATH || 'data/pageviews.json'

interface PageviewsState {
  total: number
  updated_at: string
}

function ensureFile(): PageviewsState {
  try {
    if (!existsSync(PAGEVIEWS_PATH)) {
      const dir = dirname(PAGEVIEWS_PATH)
      if (dir && dir !== '.') mkdirSync(dir, { recursive: true })
      const initial: PageviewsState = { total: 0, updated_at: new Date().toISOString() }
      writeFileSync(PAGEVIEWS_PATH, JSON.stringify(initial, null, 2), 'utf-8')
      return initial
    }
    const raw = readFileSync(PAGEVIEWS_PATH, 'utf-8')
    const parsed = JSON.parse(raw) as PageviewsState
    return {
      total: Number(parsed.total) || 0,
      updated_at: parsed.updated_at || new Date().toISOString(),
    }
  } catch {
    return { total: 0, updated_at: new Date().toISOString() }
  }
}

export function getPageviews(): number {
  return ensureFile().total
}

export function incrementPageviews(): number {
  const state = ensureFile()
  state.total += 1
  state.updated_at = new Date().toISOString()
  const dir = dirname(PAGEVIEWS_PATH)
  if (dir && dir !== '.' && !existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(PAGEVIEWS_PATH, JSON.stringify(state, null, 2), 'utf-8')
  return state.total
}
