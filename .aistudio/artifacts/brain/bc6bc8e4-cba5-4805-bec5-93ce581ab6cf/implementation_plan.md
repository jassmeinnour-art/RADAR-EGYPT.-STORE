# Implementation Plan - Fix Startup Entry Point & Preview Loading

Verify and refine the application entry point script tags in `index.html`, review `vite.config.ts` configuration for preview and dev servers, and verify full compilation.

## User Intent & Requirements
1. **Entry Point Verification**: Ensure `index.html` references `/src/main.tsx` accurately with standard `<script type="module" src="/src/main.tsx"></script>` (removing redundant `defer` attribute on module script).
2. **Preview & Server Configuration**: Ensure `vite.config.ts` has proper root paths, alias resolutions, base (`/`), CORS, and preview settings (`port: 3000`, `host: true`).
3. **Build Verification**: Run compilation and lint checks (`compile_applet` / `lint_applet`) to ensure clean output.

## Proposed Changes

### 1. Entry Point Optimization
- Update `index.html`:
  - Ensure `<script type="module" src="/src/main.tsx"></script>` is formatted cleanly without redundant attributes.
  - Verify container `<div id="root"></div>` matches `main.tsx` mount selector.

### 2. Vite & Preview Configuration
- Check `/vite.config.ts`:
  - Confirm `base: '/'` and `build.outDir: 'dist'`.
  - Ensure `@` alias points to `./src`.
  - Confirm `server` and `preview` settings run cleanly on port 3000 with `host: true`.

### 3. Build & Typecheck Verification
- Execute `compile_applet` to verify zero build errors and valid output.

## Verification Plan
1. Run `compile_applet` to confirm Vite build completes successfully.
2. Run `lint_applet` (`tsc --noEmit`) to verify zero TypeScript errors.
