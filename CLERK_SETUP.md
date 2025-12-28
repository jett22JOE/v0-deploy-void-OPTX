# Clerk Integration Setup Guide

## Overview
This guide explains how to complete the Clerk authentication setup for Jett Optics. The codebase has been updated with:

1. ✅ Clerk webhook endpoint for user synchronization
2. ✅ OAuth callback pages for social logins
3. ✅ Email verification support
4. ✅ Error handling in signup flow
5. ✅ Optimized ClerkProvider configuration

## Required Steps

### 1. Configure Clerk Dashboard

#### A. Enable Email Verification
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application: `jettoptics.ai`
3. Navigate to **User & Authentication** → **Email, Phone, Username**
4. Enable **Email address** as a required field
5. Enable **Verify at sign-up**
6. Save changes

#### B. Configure Social Login Providers (Optional)
Currently enabled in the UI:
- Google
- GitHub
- MetaMask (Web3)
- Coinbase Wallet (Web3)

To activate:
1. Navigate to **User & Authentication** → **Social Connections**
2. Enable desired providers
3. Add OAuth credentials (Client ID, Client Secret)
4. Set redirect URLs:
   - `https://jettoptics.ai/oauth-callback`
   - `https://jettoptics.ai/sso-callback`
   - `http://localhost:3000/oauth-callback` (for development)

#### C. Configure Webhooks (CRITICAL)
This is required for Clerk → Convex user synchronization.

1. Navigate to **Webhooks** in Clerk Dashboard
2. Click **Add Endpoint**
3. Enter webhook URL:
   ```
   https://jettoptics.ai/api/webhooks/clerk
   ```
4. Subscribe to events:
   - ✅ `user.created`
   - ✅ `user.updated`
5. Copy the **Signing Secret**
6. Add to your environment variables (see step 2)

### 2. Update Environment Variables

#### Local Development (.env.local)
Your `.env.local` already has most values. Ensure webhook secret is correct:

```bash
CLERK_SECRET_KEY="sk_live_uotqrdskkXEweBcrOEaAROO5kkIGF2l7J4tRw0qq6g"
CLERK_WEBHOOK_SECRET="whsec_BbZ4gi5of4wZjk3lerBMU/VzHuaQVbTa"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_Y2xlcmsuamV0dG9wdGljcy5haSQ"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
```

#### Vercel Production
Add environment variables in Vercel Dashboard:
1. Go to your project: `v0-deploy-void-optx`
2. Navigate to **Settings** → **Environment Variables**
3. Add the following (if not already present):

```bash
CLERK_SECRET_KEY=sk_live_uotqrdskkXEweBcrOEaAROO5kkIGF2l7J4tRw0qq6g
CLERK_WEBHOOK_SECRET=whsec_BbZ4gi5of4wZjk3lerBMU/VzHuaQVbTa
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuamV0dG9wdGljcy5haSQ
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CONVEX_URL=https://hushed-nightingale-624.convex.cloud
CONVEX_DEPLOYMENT=prod:hushed-nightingale-624
```

**Note:** Removed `NEXT_PUBLIC_WAITLIST_MODE` - no longer needed as we're using full signup.

### 3. Test Webhook Locally (Optional)

To test webhooks during development:

```bash
# Install Clerk CLI
npm install -g @clerk/clerk-cli

# Forward webhooks to localhost
clerk webhook forward --url http://localhost:3000/api/webhooks/clerk
```

### 4. Deploy to Vercel

```bash
# Build and test locally first
pnpm build

# Deploy to Vercel
vercel --prod

# Or use Git deployment (recommended)
git add .
git commit -m "fix: Complete Clerk signup integration with webhooks"
git push origin main
```

Vercel will automatically deploy from your main branch.

## New Files Created

### Webhook Endpoint
**Location:** `app/api/webhooks/clerk/route.ts`

Handles Clerk webhook events:
- `user.created` - Syncs new users to Convex
- `user.updated` - Updates existing users in Convex

### OAuth Callback Pages
**Locations:**
- `app/sso-callback/page.tsx` - SSO login callback
- `app/oauth-callback/page.tsx` - OAuth provider callback

These pages handle the redirect after successful social login.

## How the Signup Flow Works

1. **User visits homepage** → Clicks "ENTER SPACE" button
2. **Navigates to `/loading`** → Animated loading screen appears
3. **Clicks "Get Early Access"** → Clerk SignUp modal opens
4. **User signs up via:**
   - Email + Password
   - Google OAuth
   - GitHub OAuth
   - MetaMask (Web3)
   - Coinbase Wallet (Web3)
5. **Clerk creates account** → Sends webhook to `/api/webhooks/clerk`
6. **Webhook handler** → Calls `syncProfile()` in Convex
7. **User redirected** → `/?joined=true`
8. **Success toast** → "Welcome to Jett Optics! Check your email to verify."
9. **Email verification** → User receives Clerk verification email
10. **Account activated** → User can sign in

## Troubleshooting

### Issue: Users not syncing to Convex
**Solution:**
1. Check webhook is configured in Clerk Dashboard
2. Verify `CLERK_WEBHOOK_SECRET` is correct in environment variables
3. Check webhook logs in Clerk Dashboard → Webhooks → Recent Events
4. Check Vercel function logs for `/api/webhooks/clerk`

### Issue: OAuth logins not working
**Solution:**
1. Ensure OAuth providers are enabled in Clerk Dashboard
2. Verify redirect URLs are configured:
   - `https://jettoptics.ai/oauth-callback`
   - `https://jettoptics.ai/sso-callback`
3. Check provider credentials (Client ID, Secret) are valid

### Issue: Email verification not sending
**Solution:**
1. Enable email verification in Clerk Dashboard
2. Go to **Email & SMS** → **Templates**
3. Ensure "Verification code" template is active
4. Check Clerk email sending is not paused

### Issue: "This page could not be found" on /loading
**Solution:**
1. Clear Next.js cache: `rm -rf .next`
2. Rebuild: `pnpm build`
3. Restart dev server: `pnpm dev`

## Security Considerations

### Environment Variables
- Never commit `.env.local` to Git (already in `.gitignore`)
- Rotate `CLERK_SECRET_KEY` and `CLERK_WEBHOOK_SECRET` if exposed
- Use Vercel environment variables for production secrets

### Webhook Verification
The webhook endpoint verifies all requests using the `svix` library:
```typescript
const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "")
evt = wh.verify(body, headers) // Throws error if invalid
```

### Domain Validation
The ClerkProvider only initializes on approved domains:
- `jettoptics.ai`
- `*.jettoptics.ai` (subdomains)
- `localhost` (development)
- `127.0.0.1` (development)

## Testing the Complete Flow

1. **Start local dev server:**
   ```bash
   pnpm dev
   ```

2. **Open browser:**
   ```
   http://localhost:3000
   ```

3. **Test signup:**
   - Click "ENTER SPACE" → "Get Early Access"
   - Try email signup with a test email
   - Check Convex dashboard for new user entry
   - Check Clerk dashboard for new user

4. **Test OAuth (if configured):**
   - Click Google/GitHub button
   - Complete OAuth flow
   - Verify redirect to `/?joined=true`
   - Check Convex sync

5. **Test email verification:**
   - Sign up with new email
   - Check email inbox for verification code
   - Enter code in Clerk UI
   - Verify account is marked as verified

## Next Steps

1. ✅ Complete Clerk Dashboard configuration (webhooks, OAuth providers)
2. ✅ Deploy to Vercel production
3. ✅ Test complete signup flow on production
4. ⬜ Monitor webhook logs for any errors
5. ⬜ Set up email templates customization (optional)
6. ⬜ Add analytics tracking for signup conversions (optional)

## Support Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Webhooks Guide](https://clerk.com/docs/integrations/webhooks/overview)
- [Convex Authentication](https://docs.convex.dev/auth)
- [Next.js 16 + Clerk Guide](https://clerk.com/docs/quickstarts/nextjs)

---

**Last Updated:** 2025-12-27
**Version:** 1.0.0
