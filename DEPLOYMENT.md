# Deployment Guide

## Quick Start - Vercel Deployment

### Step 1: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect Next.js settings

### Step 2: Configure Environment Variables

In Vercel Project Settings → Environment Variables, add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` | Production |
| `CLERK_SECRET_KEY` | `sk_live_...` | Production |
| `NEXT_PUBLIC_CONVEX_URL` | `https://your-project.convex.cloud` | All |

### Step 3: Configure Clerk for Production

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Select your application
3. Go to **Domains** → Add your Vercel domain (e.g., `your-app.vercel.app`)
4. Go to **API Keys** → Copy production keys

### Step 4: Deploy

Click "Deploy" - Vercel handles the rest automatically.

---

## Environment Variables Reference

### Clerk Authentication (Required)

```bash
# Development
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

### Clerk URL Configuration (Optional)

```bash
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### Convex Database (Required)

```bash
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

---

## Getting Production Keys

### Clerk Keys
1. Go to https://dashboard.clerk.com
2. Select your application
3. Navigate to "API Keys" section
4. Switch to "Production" instance
5. Copy production keys (`pk_live_...` and `sk_live_...`)

### Convex URL
1. Go to https://dashboard.convex.dev
2. Select your project
3. Copy the deployment URL

---

## Pre-Deployment Checklist

- [ ] Clerk production keys configured in Vercel
- [ ] Clerk domain configured (add your Vercel domain)
- [ ] Convex deployment URL set
- [ ] Test authentication flow after deployment
- [ ] Verify all environment variables in Vercel dashboard

## Troubleshooting

### "Clerk: Missing publishable key"
- Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in Vercel
- Redeploy after adding environment variables

### Authentication not working
- Verify your domain is added in Clerk Dashboard → Domains
- Check that production keys (not test keys) are used

### Convex connection issues
- Verify `NEXT_PUBLIC_CONVEX_URL` is correct
- Ensure Convex project is deployed to production
