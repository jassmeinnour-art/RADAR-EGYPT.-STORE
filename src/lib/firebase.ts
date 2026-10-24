/**
 * Firebase Client & Security Wrapper (src/lib/firebase.ts)
 * 
 * Re-exports from src/firebase.ts for uniform, production-grade configuration.
 * All operations pull strictly from live environment variables and firebase-applet-config.json.
 * Mock fallbacks are disabled.
 */

export * from '../firebase';
export { default } from '../firebase';
