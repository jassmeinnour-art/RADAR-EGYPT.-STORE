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
  build: {
    outDir: 'dist',
    target: 'es2020',
    sourcemap: false,
    cssMinify: true,
    chunkSizeWarningLimit: 1500,
    minify: 'terser',
    terserOptions: {
      compress: {
        passes: 2,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'supabase': ['@supabase/supabase-js'],
          'charts': ['recharts'],
          'ui-icons': ['lucide-react', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities', 'qrcode.react'],
          'animations': ['framer-motion', 'canvas-confetti'],
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
