import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import type {
  AuthenticatorTransportFuture,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  WebAuthnCredential,
} from '@simplewebauthn/server'
import { randomBytes } from 'node:crypto'
import {
  loadSettings,
  saveSettings,
  normalizePasskeyNote,
  passkeyInfos,
  type PasskeyRecord,
} from './config'
import { passkeyCredentialId, toBase64URL, toSimpleWebAuthnCredential } from './passkeyCodec'

const RP_NAME = 'GitShow Admin'
const sessions = new Map<string, { challenge: string; type: 'reg' | 'auth' }>()

function getRpId(origin: string): string {
  try {
    return new URL(origin).hostname
  } catch {
    return 'localhost'
  }
}

function getOrigin(event: { headers: Headers }): string {
  const host = event.headers.get('x-forwarded-host') || event.headers.get('host') || 'localhost:3000'
  const proto = event.headers.get('x-forwarded-proto') || 'http'
  return `${proto}://${host}`
}

function getCredentials(): WebAuthnCredential[] {
  const st = loadSettings()
  const creds: WebAuthnCredential[] = []
  for (const pk of st.passkeys || []) {
    const c = toSimpleWebAuthnCredential(pk.credential)
    if (c) creds.push(c)
  }
  for (const legacy of st.passkey_credentials || []) {
    const c = toSimpleWebAuthnCredential(legacy)
    if (c) creds.push(c)
  }
  return creds
}

function findPasskeyRecord(st: ReturnType<typeof loadSettings>, id: string) {
  const targetId = toBase64URL(id)
  for (const pk of st.passkeys || []) {
    const pkId = pk.id ? toBase64URL(pk.id) : passkeyCredentialId(pk.credential as WebAuthnCredential)
    if (pkId === targetId) return { type: 'passkey' as const, index: (st.passkeys || []).indexOf(pk), record: pk }
  }
  for (let i = 0; i < (st.passkey_credentials || []).length; i++) {
    const normalized = toSimpleWebAuthnCredential(st.passkey_credentials![i])
    if (normalized && normalized.id === targetId) {
      return { type: 'legacy' as const, index: i, credential: normalized }
    }
  }
  return null
}

export async function passkeyRegisterStart(event: { headers: Headers }) {
  const origin = getOrigin(event)
  const rpID = getRpId(origin)
  const exclude = getCredentials().map((c) => ({ id: c.id, transports: c.transports }))

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID,
    userName: 'admin',
    userDisplayName: 'GitShow Admin',
    userID: new TextEncoder().encode('gitshow-admin'),
    excludeCredentials: exclude,
    authenticatorSelection: { residentKey: 'preferred' },
  })

  const sessionId = randomBytes(16).toString('hex')
  sessions.set(sessionId, { challenge: options.challenge, type: 'reg' })
  return { session_id: sessionId, options }
}

export async function passkeyRegisterFinish(
  event: { headers: Headers },
  sessionId: string,
  body: RegistrationResponseJSON,
  note: string,
) {
  const session = sessions.get(sessionId)
  if (!session || session.type !== 'reg') throw new Error('invalid passkey session')

  const origin = getOrigin(event)
  const rpID = getRpId(origin)
  const verification = await verifyRegistrationResponse({
    response: body,
    expectedChallenge: session.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  })
  sessions.delete(sessionId)
  if (!verification.verified || !verification.registrationInfo) {
    throw new Error('passkey verification failed')
  }

  const { credential } = verification.registrationInfo
  const st = loadSettings()
  const now = new Date().toISOString()
  const id = Buffer.from(credential.id).toString('base64url')
  const record: PasskeyRecord = {
    id,
    note: normalizePasskeyNote(note),
    created_at: now,
    credential: {
      id: credential.id,
      publicKey: credential.publicKey,
      counter: credential.counter,
      transports: credential.transports as AuthenticatorTransportFuture[] | undefined,
    },
  }
  st.passkeys = [...(st.passkeys || []), record]
  saveSettings(st)
  return { ok: true, count: st.passkeys.length }
}

export async function passkeyLoginStart(event: { headers: Headers }) {
  const credentials = getCredentials()
  if (!credentials.length) throw new Error('passkey not configured')

  const origin = getOrigin(event)
  const rpID = getRpId(origin)
  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: credentials.map((c) => ({ id: c.id, transports: c.transports })),
  })

  const sessionId = randomBytes(16).toString('hex')
  sessions.set(sessionId, { challenge: options.challenge, type: 'auth' })
  return { session_id: sessionId, options }
}

export async function passkeyLoginFinish(
  event: { headers: Headers },
  sessionId: string,
  body: AuthenticationResponseJSON,
) {
  const session = sessions.get(sessionId)
  if (!session || session.type !== 'auth') throw new Error('invalid passkey session')

  const origin = getOrigin(event)
  const rpID = getRpId(origin)
  const st = loadSettings()
  const found = findPasskeyRecord(st, body.id)
  if (!found) throw new Error('credential not found')

  const credential = found.type === 'passkey'
    ? (toSimpleWebAuthnCredential(found.record.credential) || found.record.credential as WebAuthnCredential)
    : found.credential

  const verification = await verifyAuthenticationResponse({
    response: body,
    expectedChallenge: session.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential,
  })
  sessions.delete(sessionId)
  if (!verification.verified) throw new Error('passkey verification failed')

  if (verification.authenticationInfo?.newCounter !== undefined) {
    credential.counter = verification.authenticationInfo.newCounter
  }
  if (found.type === 'passkey') {
    found.record.last_used_at = new Date().toISOString()
    found.record.credential = {
      id: credential.id,
      publicKey: credential.publicKey,
      counter: credential.counter,
      transports: credential.transports,
    }
    if (!found.record.id) found.record.id = credential.id
  } else {
    const legacy = st.passkey_credentials![found.index] as Record<string, unknown>
    const auth = legacy.authenticator as { signCount?: number } | undefined
    if (auth) auth.signCount = credential.counter
  }
  saveSettings(st)
  return { ok: true }
}

export function passkeyUpdate(id: string, note: string) {
  const st = loadSettings()
  const found = findPasskeyRecord(st, id)
  if (!found) throw new Error('passkey not found')
  if (found.type === 'passkey') {
    found.record.note = normalizePasskeyNote(note)
    saveSettings(st)
    return { ok: true, passkey_items: passkeyInfos(st) }
  }
  const now = new Date().toISOString()
  st.passkey_credentials = (st.passkey_credentials || []).filter((_, i) => i !== found.index)
  st.passkeys = [...(st.passkeys || []), {
    id: found.credential.id,
    note: normalizePasskeyNote(note),
    created_at: now,
    credential: found.credential,
  }]
  saveSettings(st)
  return { ok: true, passkey_items: passkeyInfos(st) }
}

export function passkeyDelete(id: string) {
  const st = loadSettings()
  let removed = false
  const targetId = toBase64URL(id)
  st.passkeys = (st.passkeys || []).filter((p) => {
    const pkId = p.id ? toBase64URL(p.id) : passkeyCredentialId(p.credential as WebAuthnCredential)
    if (pkId === targetId) { removed = true; return false }
    return true
  })
  const legacy = (st.passkey_credentials || []).filter((cred) => {
    const normalized = toSimpleWebAuthnCredential(cred)
    if (normalized && normalized.id === targetId) { removed = true; return false }
    return true
  })
  st.passkey_credentials = legacy
  if (!removed) throw new Error('passkey not found')
  saveSettings(st)
  return { ok: true, count: (st.passkeys?.length || 0) + (st.passkey_credentials?.length || 0), passkey_items: passkeyInfos(st) }
}

export function passkeyReset() {
  const st = loadSettings()
  st.passkeys = []
  st.passkey_credentials = []
  saveSettings(st)
  return { ok: true }
}

export { passkeyInfos, passkeyCredentialId, toBase64URL }
