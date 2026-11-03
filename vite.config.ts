import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui': ['lucide-react', 'recharts']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['@imgly/background-removal']
  }
})
