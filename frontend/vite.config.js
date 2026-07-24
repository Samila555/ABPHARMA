import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('/react/'))
              return 'vendor-react';
            if (id.includes('framer-motion') || id.includes('react-hot-toast') || id.includes('react-icons'))
              return 'vendor-ui';
            if (id.includes('chart.js') || id.includes('react-chartjs-2'))
              return 'vendor-charts';
            if (id.includes('react-hook-form') || id.includes('axios'))
              return 'vendor-forms';
            if (id.includes('date-fns') || id.includes('zustand') || id.includes('jspdf'))
              return 'vendor-utils';
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})

