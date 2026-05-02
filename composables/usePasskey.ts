const base64UrlToBuffer = (value: string) => {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

const bufferToBase64Url = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

const prepareCreationOptions = (options: any) => {
  const publicKey = { ...(options.publicKey || options) }
  publicKey.challenge = base64UrlToBuffer(publicKey.challenge)
  publicKey.user = {
    ...publicKey.user,
    id: base64UrlToBuffer(publicKey.user.id),
  }
  if (publicKey.excludeCredentials) {
    publicKey.excludeCredentials = publicKey.excludeCredentials.map((credential: any) => ({
      ...credential,
      id: base64UrlToBuffer(credential.id),
    }))
  }
  return publicKey
}

const prepareRequestOptions = (options: any) => {
  const publicKey = { ...(options.publicKey || options) }
  publicKey.challenge = base64UrlToBuffer(publicKey.challenge)
  if (publicKey.allowCredentials) {
    publicKey.allowCredentials = publicKey.allowCredentials.map((credential: any) => ({
      ...credential,
      id: base64UrlToBuffer(credential.id),
    }))
  }
  return publicKey
}

const credentialToJSON = (credential: any) => {
  const response: Record<string, any> = {
    clientDataJSON: bufferToBase64Url(credential.response.clientDataJSON),
  }

  if (credential.response.attestationObject) {
    response.attestationObject = bufferToBase64Url(credential.response.attestationObject)
  }
  if (credential.response.authenticatorData) {
    response.authenticatorData = bufferToBase64Url(credential.response.authenticatorData)
  }
  if (credential.response.signature) {
    response.signature = bufferToBase64Url(credential.response.signature)
  }
  if (credential.response.userHandle) {
    response.userHandle = bufferToBase64Url(credential.response.userHandle)
  }
  if (typeof credential.response.getTransports === 'function') {
    response.transports = credential.response.getTransports()
  }

  return {
    id: credential.id,
    rawId: bufferToBase64Url(credential.rawId),
    type: credential.type,
    response,
    clientExtensionResults: credential.getClientExtensionResults(),
    authenticatorAttachment: credential.authenticatorAttachment,
  }
}

export const usePasskey = () => {
  const api = useApi()

  const isSupported = () => import.meta.client && !!window.PublicKeyCredential

  const registerPasskey = async (note = '') => {
    if (!isSupported()) {
      throw new Error('passkey unsupported')
    }
    const start = await api.passkeyRegisterStart()
    const credential = await navigator.credentials.create({
      publicKey: prepareCreationOptions(start.options),
    })
    if (!credential) {
      throw new Error('passkey registration cancelled')
    }
    return api.passkeyRegisterFinish(start.session_id, credentialToJSON(credential), note)
  }

  const loginWithPasskey = async () => {
    if (!isSupported()) {
      throw new Error('passkey unsupported')
    }
    const start = await api.passkeyLoginStart()
    const credential = await navigator.credentials.get({
      publicKey: prepareRequestOptions(start.options),
    })
    if (!credential) {
      throw new Error('passkey login cancelled')
    }
    return api.passkeyLoginFinish(start.session_id, credentialToJSON(credential))
  }

  return {
    isSupported,
    registerPasskey,
    loginWithPasskey,
  }
}
