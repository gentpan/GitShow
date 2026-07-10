import type { AuthenticatorTransportFuture, WebAuthnCredential } from '@simplewebauthn/server'

export function toBase64URL(id: string | Uint8Array | Buffer): string {
  if (typeof id !== 'string') return Buffer.from(id).toString('base64url')
  if (!/[+/=]/.test(id)) return id
  return Buffer.from(id, 'base64').toString('base64url')
}

export function passkeyCredentialId(credential: { id: string | Uint8Array | Buffer }): string {
  return toBase64URL(credential.id)
}

function decodeBase64Bytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
  return new Uint8Array(Buffer.from(padded, 'base64'))
}

function decodePublicKey(value: unknown): Uint8Array | null {
  if (value instanceof Uint8Array) return value
  if (Array.isArray(value)) return new Uint8Array(value)
  if (value && typeof value === 'object') {
    const keys = Object.keys(value as Record<string, unknown>).filter((k) => /^\d+$/.test(k))
    if (keys.length) {
      const max = Math.max(...keys.map(Number))
      const bytes = new Uint8Array(max + 1)
      for (const key of keys) bytes[Number(key)] = Number((value as Record<string, number>)[key])
      return bytes
    }
  }
  if (typeof value === 'string') return decodeBase64Bytes(value)
  return null
}

export function toSimpleWebAuthnCredential(raw: unknown): WebAuthnCredential | null {
  if (!raw || typeof raw !== 'object') return null
  const cred = raw as Record<string, unknown>
  const publicKey = decodePublicKey(cred.publicKey)
  if (!publicKey) return null

  const idRaw = cred.id
  if (typeof idRaw !== 'string' && !(idRaw instanceof Uint8Array) && !Buffer.isBuffer(idRaw)) return null

  const counter = typeof cred.counter === 'number'
    ? cred.counter
    : typeof (cred.authenticator as { signCount?: number } | undefined)?.signCount === 'number'
      ? (cred.authenticator as { signCount: number }).signCount
      : 0

  const transports = (cred.transports || cred.transport) as AuthenticatorTransportFuture[] | undefined

  return {
    id: toBase64URL(idRaw as string | Uint8Array | Buffer),
    publicKey,
    counter,
    transports,
  }
}
