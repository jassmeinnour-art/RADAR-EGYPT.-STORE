import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': path.resolve(__dirname, '.'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 4000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor')) return 'vendor-charts';
            if (id.includes('xlsx')) return 'vendor-xlsx';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('motion') || id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('html2canvas') || id.includes('canvas-confetti')) return 'vendor-canvas';
            if (id.includes('@google/genai')) return 'vendor-genai';
            return 'vendor';
          }
          if (
            id.includes('/src/data/') ||
            id.includes('/src/services/') ||
            id.includes('/src/utils/')
          ) {
            return 'app-core-logic';
          }
          if (id.includes('/src/components/')) {
            if (id.includes('SalesDashboard') || id.includes('RemoteMerchantsManager') || id.includes('MerchantImageStudio')) {
              return 'app-dashboard-studio';
            }
            if (id.includes('InventoryTracker') || id.includes('MerchantCatalogManager') || id.includes('SmartShopperPriceComparisonHub')) {
              return 'app-inventory-catalog';
            }
            if (id.includes('CompetitorRadar') || id.includes('RealTimeProductPriceComparison') || id.includes('WatchlistManager')) {
              return 'app-radar-watchlist';
            }
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
    historyApiFallback: true,
    strictPort: false,
    hmr: false,
  },
});
