import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 3000,
    host: true
  },
  preview: {
    port: 3000,
    host: true
  },
  build: {
    chunkSizeWarningLimit: 1200,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'ui': ['lucide-react', 'recharts', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities', 'qrcode.react'],
          'motion': ['framer-motion', 'motion', 'canvas-confetti'],
          'export-docs': ['jspdf', 'jspdf-autotable', 'html2canvas', 'xlsx'],
          'analytics': ['@vercel/analytics', '@vercel/speed-insights'],
          'genai': ['@google/genai']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['@imgly/background-removal']
  }
})
