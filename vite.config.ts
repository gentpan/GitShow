import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  server: { port: 3000 },
  plugins: [
    nitro({ preset: 'bun', serverDir: 'server' }),
    tanstackStart(),
    viteReact(),
  ],
})
