import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 59998,
  },
  build: {
    outDir: 'kalong/static',
  },
  envPrefix: 'KALONG_',
})
