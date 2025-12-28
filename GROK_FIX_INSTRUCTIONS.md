# GROK - CLERK SIGNUP FIX INSTRUCTIONS

## CRITICAL ISSUES IDENTIFIED

### Issue 1: Missing Clerk Webhook Integration
**Problem:** Users sign up in Clerk but are never synced to Convex database. No email verification triggers.

**Root Cause:** No webhook endpoint exists to receive Clerk events.

**Fix Required:**
1. Create `/app/api/webhooks/clerk/route.ts`
2. Install `svix` package for webhook signature verification
3. Implement webhook handler that:
   - Verifies webhook signature using CLERK_WEBHOOK_SECRET
   - Handles `user.created` event → calls Convex `syncProfile()` mutation
   - Handles `user.updated` event → updates Convex user data
   - Returns appropriate HTTP status codes

**Code Template:**
```typescript
import { headers } from "next/headers"
import { Webhook } from "svix"
import { WebhookEvent } from "@clerk/nextjs/server"
import { api } from "@/convex/_generated/api"
import { ConvexHttpClient } from "convex/browser"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(req: Request) {
  // Get svix headers for verification
  // Verify webhook signature
  // Handle user.created and user.updated events
  // Call convex.mutation(api.users.syncProfile, {...})
  // Return 200 on success, 400/500 on error
}
```

---

### Issue 2: Missing OAuth Callback Pages
**Problem:** Social logins (Google, GitHub, MetaMask, Coinbase) fail silently because callback routes have no handlers.

**Root Cause:** Middleware defines routes `/sso-callback` and `/oauth-callback` but no page components exist.

**Fix Required:**
1. Create `/app/sso-callback/page.tsx`
2. Create `/app/oauth-callback/page.tsx`
3. Both should:
   - Use `useAuth()` from Clerk to check sign-in status
   - Redirect to `/?joined=true` on success
   - Redirect to `/sign-in` on failure
   - Show loading spinner while checking

**Code Template:**
```typescript
"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"

export default function SSOCallbackPage() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useAuth()

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        router.push("/?joined=true")
      } else {
        router.push("/sign-in")
      }
    }
  }, [isLoaded, isSignedIn, router])

  return (
    // Loading spinner UI
  )
}
```

---

### Issue 3: No Email Verification Configuration
**Problem:** SignUp component doesn't enforce email verification. Users told to "check email" but no email sent.

**Root Cause:** Missing verification flow configuration in SignUp component.

**Fix Required:**
Update `/app/loading/page.tsx`:
1. Add error state: `const [signUpError, setSignUpError] = useState<string | null>(null)`
2. Update SignUp component to include error display below form
3. Ensure `forceRedirectUrl="/?joined=true"` is set
4. Add comprehensive error handling UI

---

### Issue 4: Waitlist Mode Confusion
**Problem:** Environment has `NEXT_PUBLIC_WAITLIST_MODE="true"` but code uses full signup, creating confusion.

**Root Cause:** Leftover from previous waitlist implementation.

**Fix Required:**
1. Remove `NEXT_PUBLIC_WAITLIST_MODE` from `.env.local`
2. Update all "waitlist" comments to "signup" in `/app/loading/page.tsx`:
   - Line 115: Change "Join Waitlist Button" → "Get Early Access Button"
   - Line 157: Change "Clerk Waitlist Modal" → "Clerk SignUp Modal"
3. Rename CSS class from `clerk-waitlist-wrapper` to `clerk-signup-wrapper` (all instances)

---

### Issue 5: Suboptimal ClerkProvider Configuration
**Problem:** ClerkProvider missing theme variables and URL configurations, causing inconsistent styling.

**Root Cause:** Incomplete appearance configuration.

**Fix Required:**
Update `/components/clerk-provider-wrapper.tsx`:
1. Add `signInUrl="/sign-in"` and `signUpUrl="/loading"` props
2. Expand `appearance.variables` to include:
   ```typescript
   colorText: "#ffffff",
   colorTextSecondary: "#a1a1aa",
   colorBackground: "#0a0a0a",
   colorInputBackground: "#18181b",
   colorInputText: "#ffffff",
   borderRadius: "0.5rem",
   ```
3. Add card background to elements:
   ```typescript
   card: {
     backgroundColor: "rgba(10, 10, 10, 0.95)",
   }
   ```

---

### Issue 6: Missing Dependencies
**Problem:** Webhook code requires `svix` package which is not installed.

**Fix Required:**
```bash
pnpm add svix
```

---

## POTENTIAL BUGS & SECURITY ISSUES

### Security Issue 1: Environment Variable Exposure
**Severity:** HIGH
**Problem:** `.env.local` contains production secrets and should never be committed to Git.

**Recommendation:**
- Verify `.env.local` is in `.gitignore`
- Move all secrets to Vercel environment variables
- Rotate `CLERK_SECRET_KEY` and `CLERK_WEBHOOK_SECRET` if exposed

### Security Issue 2: No Rate Limiting
**Severity:** MEDIUM
**Problem:** Signup endpoint has no rate limiting, vulnerable to abuse.

**Recommendation:**
- Implement rate limiting middleware
- Consider Vercel's built-in rate limiting
- Add CAPTCHA for suspicious activity

### Security Issue 3: No CSRF Protection on Webhook
**Severity:** LOW (mitigated by signature verification)
**Problem:** While webhook uses signature verification, no additional CSRF tokens.

**Recommendation:**
- Current svix signature verification is sufficient
- Ensure `CLERK_WEBHOOK_SECRET` is never exposed

---

## CONVEX + CLERK INTEGRATION ISSUES

### Issue 1: No JWT Claims Configuration
**Problem:** Convex doesn't automatically know about Clerk users without webhook sync.

**Impact:** If webhook fails, user is authenticated in Clerk but has no Convex permissions.

**Fix Required:**
1. Ensure webhook endpoint is robust with retry logic
2. Add logging to webhook handler for debugging
3. Monitor webhook failures in Clerk Dashboard

### Issue 2: Stale Data Risk
**Problem:** If webhook fails, databases become out of sync.

**Recommendation:**
- Add webhook retry logic
- Implement periodic sync job to reconcile differences
- Log all webhook events for audit trail

### Issue 3: No Auth State Sync
**Problem:** User deleted in Clerk doesn't automatically delete from Convex.

**Fix Required:**
- Add `user.deleted` webhook handler
- Implement soft delete in Convex (set `isActive: false`)

---

## DEPLOYMENT CHECKLIST

### Clerk Dashboard Configuration
1. ✅ Enable email verification: User & Authentication → Email settings
2. ✅ Configure webhook endpoint: `https://jettoptics.ai/api/webhooks/clerk`
3. ✅ Subscribe to events: `user.created`, `user.updated`, `user.deleted`
4. ✅ Copy webhook signing secret to environment variables
5. ⬜ Enable OAuth providers (Google, GitHub, etc.)
6. ⬜ Set OAuth redirect URLs

### Vercel Environment Variables
Add these to Vercel Dashboard:
```bash
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CONVEX_URL=https://hushed-nightingale-624.convex.cloud
CONVEX_DEPLOYMENT=prod:hushed-nightingale-624
XAI_API_KEY=xai-...
```

### Code Changes Summary
1. Create webhook endpoint: `app/api/webhooks/clerk/route.ts`
2. Create OAuth callbacks: `app/sso-callback/page.tsx`, `app/oauth-callback/page.tsx`
3. Update SignUp error handling in `app/loading/page.tsx`
4. Remove waitlist references in `app/loading/page.tsx`
5. Optimize ClerkProvider in `components/clerk-provider-wrapper.tsx`
6. Install svix package: `pnpm add svix`
7. Remove `NEXT_PUBLIC_WAITLIST_MODE` from `.env.local`

---

## TESTING INSTRUCTIONS

### Test 1: Email Signup
1. Visit `http://localhost:3000`
2. Click "ENTER SPACE" → "Get Early Access"
3. Enter test email and password
4. Submit form
5. ✅ Verify redirect to `/?joined=true`
6. ✅ Verify success toast appears
7. ✅ Check Convex dashboard for new user entry
8. ✅ Check email for verification code

### Test 2: OAuth Signup (Google)
1. Click Google button in signup modal
2. Complete Google OAuth flow
3. ✅ Verify redirect to `/oauth-callback`
4. ✅ Verify redirect to `/?joined=true`
5. ✅ Check Convex sync

### Test 3: Webhook Verification
1. Sign up with new user
2. Check Clerk Dashboard → Webhooks → Recent Events
3. ✅ Verify `user.created` event shows "Success" (200)
4. Check Vercel logs for function execution
5. ✅ Verify Convex has user record with `clerkUserId`

---

## GROK IMPLEMENTATION ORDER

Execute in this sequence:

1. **Install Dependencies**
   ```bash
   pnpm add svix
   ```

2. **Create Webhook Endpoint**
   - File: `app/api/webhooks/clerk/route.ts`
   - Implement full webhook handler with signature verification
   - Add error logging

3. **Create OAuth Callback Pages**
   - File: `app/sso-callback/page.tsx`
   - File: `app/oauth-callback/page.tsx`
   - Use provided template with loading states

4. **Update Loading Page**
   - File: `app/loading/page.tsx`
   - Add error state and display
   - Rename all "waitlist" → "signup"
   - Rename CSS classes

5. **Optimize ClerkProvider**
   - File: `components/clerk-provider-wrapper.tsx`
   - Add URL props
   - Expand theme configuration

6. **Clean Environment Variables**
   - File: `.env.local`
   - Remove `NEXT_PUBLIC_WAITLIST_MODE`

7. **Test Locally**
   - Run `pnpm dev`
   - Test complete signup flow
   - Verify webhook execution

8. **Deploy to Vercel**
   - Build: `pnpm build`
   - Deploy: `vercel --prod`

---

## ERROR HANDLING REQUIREMENTS

All code must include comprehensive error handling:

### Webhook Endpoint
```typescript
try {
  // Webhook logic
  return new Response("Success", { status: 200 })
} catch (error) {
  console.error("Webhook error:", error)
  return new Response("Internal error", { status: 500 })
}
```

### OAuth Callbacks
```typescript
if (!isLoaded) {
  return <LoadingSpinner />
}

if (isSignedIn) {
  router.push("/?joined=true")
} else {
  console.error("OAuth sign-in failed")
  router.push("/sign-in?error=oauth_failed")
}
```

---

## SUCCESS CRITERIA

✅ All code changes implemented by Grok
✅ No TypeScript errors
✅ No build errors
✅ Webhook endpoint returns 200 on valid requests
✅ OAuth callbacks redirect correctly
✅ Email signup creates user in Convex
✅ Social login creates user in Convex
✅ Success toast displays after signup
✅ All "waitlist" references removed
✅ ClerkProvider properly configured

---

**GROK: Please implement all fixes in the order specified above. Use the XAI SDK and HEDGEHOG MCP tools as needed. Report completion status for each step.**
