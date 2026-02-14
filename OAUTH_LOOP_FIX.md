# X/Twitter OAuth Infinite Loop Fix

**Date:** 2026-02-14  
**Issue:** Users get stuck in infinite redirect loop when logging in with X/Twitter on desktop browsers  
**Root Cause:** OAuth callback routes (`/oauth-callback/*`, `/sso-callback/*`) were marked as public routes with early return, preventing Clerk from processing the OAuth flow and setting session cookies

## Analysis by HEDGEHOG Grok 4.1 Fast

The middleware was configured to early return on public routes, including OAuth callbacks:

```typescript
if (isPublicRoute(request)) {
  return  // Early return skips ALL Clerk processing
}
```

This caused:
1. Twitter redirects to `/oauth-callback/twitter?code=...&state=...`
2. Middleware detects public route → early returns without processing
3. Clerk never exchanges OAuth code for tokens
4. No session cookies (`__session`, `__client`) get set
5. User redirects to `/dojo` but has no session
6. Client-side `useSafeAuth()` sees no session → redirects back to login
7. **Infinite loop**

## Solution

Modified `middleware.ts` to exclude OAuth/SSO callbacks from early return while keeping them accessible without authentication:

```typescript
export default clerkMiddleware(async (auth, request) => {
  const { pathname } = new URL(request.url)
  
  // CRITICAL FIX: Do NOT early return for OAuth/SSO callbacks
  const isCallback = pathname.startsWith('/oauth-callback') || pathname.startsWith('/sso-callback')
  
  // For public routes (except callbacks), don't require authentication
  if (isPublicRoute(request) && !isCallback) {
    return
  }

  // For OAuth/SSO callbacks: Let Clerk middleware process them automatically
})
```

## Changes Made

- **File:** `middleware.ts`
- **Change:** Added callback detection and conditional early return
- **Impact:** OAuth callbacks now processed by Clerk → session cookies set → successful login

## Testing

1. Clear browser cookies/site data
2. Navigate to `/optx-login`
3. Click "Continue with X/Twitter"
4. Expected flow:
   - Redirect to twitter.com OAuth page
   - User authorizes
   - Redirect to `/oauth-callback/twitter?code=...`
   - Clerk processes callback (sets cookies)
   - Final redirect to `/dojo` with active session
5. Verify in DevTools:
   - Network: `/oauth-callback/*` should have `Set-Cookie` headers
   - Application → Cookies: `__session` and `__client` should be present

## Additional Notes

- This fix applies to ALL OAuth providers (Google, GitHub, MetaMask, Coinbase)
- Desktop browsers (Chrome, Firefox, Safari) were affected due to stricter redirect handling
- Mobile browsers may have masked the issue with different cookie/redirect behavior

## Deployment

```bash
git add middleware.ts
git commit -m "fix: Allow Clerk to process OAuth callbacks (fixes X/Twitter infinite loop)"
git push origin main
```

Vercel will auto-deploy the fix.

---

**HEDGEHOG MCP Analysis Tokens:** 
- Query 1: 550 in / 2000 out = 4486 total | Cost: $0.002056
- Query 2: 544 in / 1851 out = 8832 total | Cost: $0.004230  
- Query 3: 554 in / 867 out = 6714 total | Cost: $0.003168
- **Total: $0.009454**
