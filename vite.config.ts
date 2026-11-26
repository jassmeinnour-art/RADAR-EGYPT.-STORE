import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-is']
  },
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
        manualChunks(id) {
          if (id.includes('/src/components/ImportErrorLog')) {
            return 'import-issues-log';
          }
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('/node_modules/firebase/') || id.includes('/node_modules/@firebase/')) {
            return 'firebase';
          }
          if (id.includes('/node_modules/@supabase/')) {
            return 'supabase';
          }
          if (
            id.includes('/node_modules/jspdf') ||
            id.includes('/node_modules/html2canvas') ||
            id.includes('/node_modules/xlsx') ||
            id.includes('/node_modules/jszip')
          ) {
            return 'export-docs';
          }
          if (id.includes('/node_modules/@google/genai')) {
            return 'genai';
          }
          return undefined;
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['@imgly/background-removal']
  }
})
