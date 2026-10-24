/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_APP_ENV?: string;
  readonly VITE_APP_MODE?: string;
  readonly VITE_ENABLE_MOCK?: string;
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_FIREBASE_DATABASE_ID?: string;
  readonly VITE_AMAZON_SP_API_ENDPOINT?: string;
  readonly VITE_AMAZON_MARKETPLACE_ID?: string;
  readonly VITE_AMAZON_REGION?: string;
  readonly VITE_AMAZON_DEFAULT_SELLER_ID?: string;
  readonly VITE_AMAZON_LWA_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
