import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '::1', // localhost should listen to ipv6 but...
    port: 59998,
  },
  build: {
    outDir: 'kalong/static',
  },
})
