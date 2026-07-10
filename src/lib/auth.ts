const base64UrlToBuffer = (value: string) => {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

const bufferToBase64Url = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

const prepareCreationOptions = (options: any) => {
  const publicKey = { ...(options.publicKey || options) }
  publicKey.challenge = base64UrlToBuffer(publicKey.challenge)
  publicKey.user = { ...publicKey.user, id: base64UrlToBuffer(publicKey.user.id) }
  if (publicKey.excludeCredentials) {
    publicKey.excludeCredentials = publicKey.excludeCredentials.map((c: any) => ({
      ...c,
      id: base64UrlToBuffer(c.id),
    }))
  }
  return publicKey
}

const prepareRequestOptions = (options: any) => {
  const publicKey = { ...(options.publicKey || options) }
  publicKey.challenge = base64UrlToBuffer(publicKey.challenge)
  if (publicKey.allowCredentials) {
    publicKey.allowCredentials = publicKey.allowCredentials.map((c: any) => ({
      ...c,
      id: base64UrlToBuffer(c.id),
    }))
  }
  return publicKey
}

const credentialToJSON = (credential: PublicKeyCredential) => {
  const response = credential.response as AuthenticatorAttestationResponse & AuthenticatorAssertionResponse
  const payload: Record<string, unknown> = {
    clientDataJSON: bufferToBase64Url(response.clientDataJSON),
  }
  if ('attestationObject' in response && response.attestationObject) {
    payload.attestationObject = bufferToBase64Url(response.attestationObject)
  }
  if ('authenticatorData' in response && response.authenticatorData) {
    payload.authenticatorData = bufferToBase64Url(response.authenticatorData)
  }
  if ('signature' in response && response.signature) {
    payload.signature = bufferToBase64Url(response.signature)
  }
  if ('userHandle' in response && response.userHandle) {
    payload.userHandle = bufferToBase64Url(response.userHandle)
  }
  return {
    id: credential.id,
    rawId: bufferToBase64Url(credential.rawId),
    type: credential.type,
    response: payload,
    clientExtensionResults: credential.getClientExtensionResults(),
    authenticatorAttachment: credential.authenticatorAttachment,
  }
}

export const passkey = {
  isSupported: () => typeof window !== 'undefined' && !!window.PublicKeyCredential,
  registerPasskey: async (note = '') => {
    const { api } = await import('./api')
    const start = await api.passkeyRegisterStart()
    const credential = await navigator.credentials.create({
      publicKey: prepareCreationOptions(start.options),
    })
    if (!credential) throw new Error('passkey registration cancelled')
    return api.passkeyRegisterFinish(start.session_id, credentialToJSON(credential as PublicKeyCredential), note)
  },
  loginWithPasskey: async () => {
    const { api } = await import('./api')
    const start = await api.passkeyLoginStart()
    const credential = await navigator.credentials.get({
      publicKey: prepareRequestOptions(start.options),
    })
    if (!credential) throw new Error('passkey login cancelled')
    return api.passkeyLoginFinish(start.session_id, credentialToJSON(credential as PublicKeyCredential))
  },
}

export const adminAuth = {
  login: () => {
    if (typeof window !== 'undefined') sessionStorage.setItem('admin_logged_in', '1')
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('admin_logged_in')
      sessionStorage.removeItem('admin_password')
    }
  },
  isLoggedIn: () =>
    typeof window !== 'undefined' && sessionStorage.getItem('admin_logged_in') === '1',
  getPassword: () =>
    typeof window !== 'undefined' ? sessionStorage.getItem('admin_password') || '' : '',
}
