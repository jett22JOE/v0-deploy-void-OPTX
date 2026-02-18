# JETT Optics - Spatial Encryption & DePIN Platform

**jettoptics.ai** | Vercel Team: space-cowboys

## Architecture

```
jettoptics.ai (Vercel/Next.js)
  /              Landing page
  /optx-login    Clerk auth (X/Twitter, Google, Email)
  /pricing       Subscription tiers (Stripe)
  /dojo          Developer dashboard (subscription-gated)
  /dojo/training DOJO Training IDE (camera, AGT tensors, JettChat)
  /security      Account settings
```

## DOJO Training IDE

Full gaze-tracking developer environment with:
- **Camera Feed** — webcam with AGT tensor overlay (COG/EMO/ENV classification)
- **AGT Tensor Analytics** — real-time bars, radar chart, trend lines (30s window)
- **JettChat** — global chat with $OPTX signature testing via JETT PIN (gaze auth)
- **JOE Agent** — AI assistant toggle (Grok 4.1 Fast via HEDGEHOG MCP)
- **Space-bar Gaze Capture** — hold space + gaze to input tensor emoticons
- **DOJOSidebar** — orange-themed navigation (DOJO, Gaze Auth, MOJO)

## Auth Flow

1. User visits `/optx-login` → Clerk handles auth (X/Twitter, Google, email)
2. On success → redirect to `/dojo`
3. `/dojo` calls `/api/verify-session` → Clerk auth + Stripe subscription check
4. Active subscription → show developer dashboard
5. "Start Training" → `/dojo/training` (full IDE with camera + gaze tracking)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind, shadcn/ui |
| Auth | Clerk (social + email) |
| Payments | Stripe (subscription tiers) |
| Database | Convex (SaaS sync) + SpacetimeDB (edge) |
| AI | Grok 4.1 Fast (xAI) via HEDGEHOG MCP |
| Blockchain | Solana ($OPTX token, DePIN attestations) |
| Edge | Jetson Orin Nano (gaze processing, JOE agent) |
| Mesh | Tailscale (encrypted WireGuard tunnels) |
| Gaze | MediaPipe + Orlosky pupil detection models |

## Key Components

- `components/gaze/AGTCircle.tsx` — AGT tensor visualization (COG/EMO/ENV)
- `components/gaze/PolynomialGazePinInput.tsx` — Gaze PIN auth with JOULE template
- `components/JETTUX.tsx` — Interactive charts (radar + donut)
- `components/AGTPointer.tsx` — Tensor pointer widget
- `components/AGTLineCharts.tsx` — Real-time tensor trend lines
- `components/DOJOSidebar.tsx` — Orange-themed sidebar navigation
- `components/solana-provider.tsx` — Phantom wallet adapter (devnet)

## API Routes

- `POST /api/verify-session` — Clerk auth + Stripe subscription verification
- `POST /api/create-checkout` — Stripe checkout session
- `POST /api/hedgehog/analyze` — Grok 4.1 OAuth analysis (HEDGEHOG MCP)
- `POST /api/webhooks/clerk` — Clerk webhook handler
- `POST /api/webhooks/stripe` — Stripe webhook handler

## Solana

- **Program**: `91SqqYLMi5zNsfMab6rnvipwJhDpN4FEMSLgu8F3bbGq`
- **$OPTX Mint**: `4r9WoPsRjJzrYEuj6VdwowVrFZaXpu16Qt6xogcmdUXC`
- **Network**: Devnet
- **Contract**: [JTX-CSTB.TRUST.DEPIN](https://github.com/jett22JOE/JTX-CSTB.TRUST.DEPIN)

## Deploy

- **Production**: [jettoptics.ai](https://jettoptics.ai)
- **Vercel Team**: space-cowboys
- **Convex (prod)**: hushed-nightingale-624
- **Convex (dev)**: agreeable-frog-746
- **Edge**: Jetson Orin Nano (Tailscale mesh — IP redacted)

## Related Repos

- [jett-optical-auth](https://github.com/jett22JOE/jett-optical-auth) — DOJO backend, SpacetimeDB, HEDGEHOG MCP
- [JTX-CSTB.TRUST.DEPIN](https://github.com/jett22JOE/JTX-CSTB.TRUST.DEPIN) — $OPTX Solana smart contract
- [JOE](https://github.com/jett22JOE/JOE) — JOE agent, wallet mgmt, x402 payments
- [eyetracker](https://github.com/JEOresearch/eyetracker) — Orlosky gaze models

## Environment Variables (Vercel)

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_CONVEX_URL=
XAI_API_KEY=
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```
