import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'esbuild',
    cssMinify: 'esbuild',
    sourcemap: false,
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: { vendor: ['react', 'react-dom'] },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  esbuild: { legalComments: 'none', minifyIdentifiers: true, minifySyntax: true, minifyWhitespace: true, drop: ['console','debugger'] },
})
