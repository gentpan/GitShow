import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tanstackStart(),
    tailwindcss(),
    react(),
  ],
  build: {
    ssr: true,
    outDir: 'dist/server',
    rollupOptions: {
      input: './src/entry-server.tsx',
    },
  },
})
