# Implementation Plan - Fix API Rate Limits & Startup Infinite Loops

## Goals
- Prevent redundant API calls and potential infinite loops during application startup.
- Robustly handle HTTP 429 (Rate Limited) responses in API calls.
- Improve fallback UI states to prevent app crashes when APIs are restricted.

## Proposed Changes

### 1. Robust API Error Handling (src/utils/merchantCatalogManager.ts)
- Update `parseSafeJsonResponse` to recognize 429 status code explicitly.
- Update API fetching functions to throw a structured error object (`RATE_LIMITED`, `API_ERROR`) for the frontend to handle.

### 2. Frontend State & Effect Management (src/components/MerchantCatalogManager.tsx)
- Optimize `useEffect` hooks: ensure they are not triggered by unstable object references.
- Implement a "rate limited" UI state.
- Add error handling for API calls that catches 429 specifically and updates the UI state to warn the user rather than crashing or spamming requests.

### 3. Build & Verification
- Verify clean compilation and linting.

## Verification
- Run `npm run build` and `tsc --noEmit`.
