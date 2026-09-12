import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/Cliente': 'http://localhost:5000',
      '/Admin': 'http://localhost:5000',
    },
  },
})
