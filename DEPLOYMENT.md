# Deployment Guide

## Environment Variables

### Clerk Authentication

For production deployment, replace development keys with production keys:

\`\`\`bash
# Development (current)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Production (required for deployment)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
\`\`\`

### Optional Clerk Configuration

These variables should only be set on the server (not prefixed with NEXT_PUBLIC_):

\`\`\`bash
# Server-side only - do not expose to client
CLERK_TELEMETRY_DEBUG=false
CLERK_TELEMETRY_DISABLED=true
\`\`\`

### Getting Production Keys

1. Go to https://dashboard.clerk.com
2. Select your application
3. Navigate to "API Keys" section
4. Copy production keys (pk_live_... and sk_live_...)
5. Update environment variables in Vercel dashboard

## Convex Database

Ensure Convex deployment URL is set:

\`\`\`bash
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOYMENT=prod:your-deployment
\`\`\`

## Pre-Deployment Checklist

- [ ] Update Clerk keys to production (pk_live_... and sk_live_...)
- [ ] Verify Convex deployment URL
- [ ] Remove any console.log debug statements
- [ ] Test authentication flow in staging
- [ ] Verify environment variables in Vercel
