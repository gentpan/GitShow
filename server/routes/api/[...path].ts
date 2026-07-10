import { handleApiRequest } from '../../utils/api'

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  let body: string | undefined
  if (event.method !== 'GET' && event.method !== 'HEAD') {
    const parsed = await readBody(event)
    body = parsed !== undefined ? JSON.stringify(parsed) : undefined
  }
  const request = new Request(url.href, {
    method: event.method,
    headers: event.headers,
    body,
  })
  const response = await handleApiRequest(request)
  const data = await response.json()
  setResponseStatus(event, response.status)
  return data
})
