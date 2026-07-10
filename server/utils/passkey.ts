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
  return (st.passkeys || []).map((pk) => pk.credential as WebAuthnCredential)
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
  const passkeys = st.passkeys || []
  const credId = body.id
  const record = passkeys.find((p) => p.id === credId)
  if (!record) throw new Error('credential not found')

  const credential = record.credential as WebAuthnCredential
  const verification = await verifyAuthenticationResponse({
    response: body,
    expectedChallenge: session.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential,
  })
  sessions.delete(sessionId)
  if (!verification.verified) throw new Error('passkey verification failed')

  record.last_used_at = new Date().toISOString()
  if (verification.authenticationInfo?.newCounter !== undefined) {
    ;(record.credential as WebAuthnCredential).counter = verification.authenticationInfo.newCounter
  }
  saveSettings(st)
  return { ok: true }
}

export function passkeyUpdate(id: string, note: string) {
  const st = loadSettings()
  const pk = (st.passkeys || []).find((p) => p.id === id)
  if (!pk) throw new Error('passkey not found')
  pk.note = normalizePasskeyNote(note)
  saveSettings(st)
  return { ok: true }
}

export function passkeyDelete(id: string) {
  const st = loadSettings()
  st.passkeys = (st.passkeys || []).filter((p) => p.id !== id)
  saveSettings(st)
  return { ok: true, count: st.passkeys.length }
}

export function passkeyReset() {
  const st = loadSettings()
  st.passkeys = []
  st.passkey_credentials = []
  saveSettings(st)
  return { ok: true }
}

export { passkeyInfos }
