import { createStartHandler } from '@tanstack/react-start/server'
import { defaultStreamHandler } from '@tanstack/react-start/server'
import { startRefreshLoop } from './server/cache'

// Warm GitHub cache only on the Node server, never in the browser bundle.
startRefreshLoop()

export default createStartHandler(defaultStreamHandler)
