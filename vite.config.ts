import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ecb-rates': {
        target: 'https://www.ecb.europa.eu',
        changeOrigin: true,
        rewrite: () => '/stats/eurofxref/eurofxref-daily.xml',
      },
    },
  },
})
