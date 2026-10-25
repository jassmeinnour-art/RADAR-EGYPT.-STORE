import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        id: '/',
        name: 'Merchant Radar Egypt | رادار التاجر المصري',
        short_name: 'Radar Egypt',
        description: 'منصة ذكية لمتابعة المنتجات والأسعار في السوق المصري مع تحليلات ذكية - رادار التاجر منصة بياع',
        theme_color: '#FF6B00',
        background_color: '#0F2A4A',
        display: 'standalone',
        display_override: ['tabbed', 'standalone', 'window-controls-overlay'],
        orientation: 'any',
        start_url: '/',
        scope: '/',
        dir: 'rtl',
        lang: 'ar-EG',
        iarc_rating_id: 'urn:iarc:pegi:3',
        edge_side_panel: {
          preferred_width: 480
        },
        note_taking: {
          new_note_url: '/?action=new_note'
        },
        widgets: [
          {
            name: 'مؤشر أسعار رادار التاجر',
            short_name: 'رادار الأسعار',
            description: 'قطعة ذكية لعرض تحديثات ومؤشرات أداء وتغيرات أسعار السوق المصري في الوقت الفعلي',
            tag: 'radar-price-tracker',
            template: 'radar-widget-template',
            ms_ac_template: '/widgets/price-tracker.json',
            data: '/api/widget-data.json',
            type: 'application/json',
            screenshots: [
              {
                src: '/pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                label: 'معاينة القطعة الذكية لمراقبة الأسعار'
              }
            ],
            icons: [
              {
                src: '/pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              }
            ],
            auth: false,
            update_interval: 3600
          }
        ],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        file_handlers: [
          {
            action: '/?import=catalog',
            name: 'سجل أسعار وكتالوج المنتجات',
            accept: {
              'text/csv': ['.csv'],
              'application/vnd.ms-excel': ['.xls'],
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
            },
            icons: [
              {
                src: '/pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              }
            ]
          }
        ],
        protocol_handlers: [
          {
            protocol: 'web+radar',
            url: '/?product_link=%s'
          },
          {
            protocol: 'web+bayyaa',
            url: '/?merchant_id=%s'
          }
        ],
        scope_extensions: [
          {
            origin: 'https://radaregypt.store'
          },
          {
            origin: '*.bayyaa.eg'
          }
        ],
        related_applications: [
          {
            platform: 'play',
            url: 'https://play.google.com/store/apps/details?id=com.merchantradaregy.app',
            id: 'com.merchantradaregy.app'
          },
          {
            platform: 'webapp',
            url: 'https://radaregypt.store/manifest.json'
          }
        ],
        prefer_related_applications: false
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  resolve: {
    dedupe: ['react', 'react-dom', 'firebase', 'framer-motion', 'lucide-react'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~': path.resolve(__dirname, '.'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime'),
      'framer-motion': path.resolve(__dirname, 'node_modules/framer-motion'),
      'clsx': path.resolve(__dirname, 'node_modules/clsx'),
    },
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react/jsx-runtime', 
      'lucide-react', 
      'firebase/app', 
      'firebase/auth', 
      'firebase/firestore',
      'xlsx',
      'canvas-confetti',
      'framer-motion',
      'clsx'
    ],
    exclude: ['@google/genai'],
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    emptyOutDir: true,
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('xlsx')) return 'vendor-xlsx';
            if (id.includes('framer-motion') || id.includes('motion')) return 'vendor-motion';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-is')) return 'vendor-react';
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    hmr: false,
    cors: true,
    watch: {
      usePolling: false,
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/.aistudio/**'],
    },
  },
  preview: {
    port: 3000,
    host: true,
  },
});


