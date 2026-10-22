import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // تصغير JS - يحل 44KB
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'],
      },
    },
    // تقسيم الكود - يحل 1048KB unused JS
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          // لو عندك مكتبات كبيرة حطها هنا
          // firebase: ['firebase/app', 'firebase/firestore'],
        },
        // اسماء ملفات قصيرة للكاش
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // تحسين الحجم
    chunkSizeWarningLimit: 500,
    reportCompressedSize: true,
  },
  // تحسين التحميل
  server: {
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    },
  },
})
