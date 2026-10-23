import fs from 'fs';
import path from 'path';

/**
 * Merchant Radar Egypt - Vite Environment & Dependency Verification Script
 * This script runs automatically via postinstall or manually to clean Vite cache
 * and verify critical dependencies compatibility for stable dev & production builds.
 */

function runViteFix() {
  console.log('🚀 [Vite Environment Fixer] Checking dependencies & cleaning cache...');

  const rootDir = process.cwd();
  const viteCachePath = path.join(rootDir, 'node_modules', '.vite');
  const distPath = path.join(rootDir, 'dist');

  // 1. Clean Vite pre-bundle cache if exists
  try {
    if (fs.existsSync(viteCachePath)) {
      console.log('🧹 [Vite Fixer] Cleaning stale node_modules/.vite cache...');
      fs.rmSync(viteCachePath, { recursive: true, force: true });
      console.log('✅ [Vite Fixer] Vite cache cleaned successfully.');
    }
  } catch (err: any) {
    console.warn('⚠️ [Vite Fixer] Could not clear .vite cache directory:', err?.message || err);
  }

  // 2. Verified: Skipping dist cleanup in postinstall to prevent artifact loss in some CI environments.
  // Vite build with emptyOutDir: true handles this safely during the build phase.

  // 3. Verify core critical dependencies exist in node_modules
  const requiredModules = ['react', 'react-dom', 'vite', 'firebase', 'lucide-react', 'express'];
  const missingModules: string[] = [];

  requiredModules.forEach((mod) => {
    const modPath = path.join(rootDir, 'node_modules', mod);
    if (!fs.existsSync(modPath)) {
      missingModules.push(mod);
    }
  });

  if (missingModules.length > 0) {
    console.warn(`⚠️ [Vite Fixer] Missing critical modules: ${missingModules.join(', ')}`);
  } else {
    console.log('✅ [Vite Fixer] All required core dependencies are present.');
  }

  console.log('🎉 [Vite Environment Fixer] Environment check completed cleanly.');
}

runViteFix();
