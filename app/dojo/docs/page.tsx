"use client"

import { useState } from "react"
import { BookOpen, Code, Eye, Shield, Wallet, Terminal, ExternalLink, Copy, Check } from "lucide-react"

const docs = [
  {
    id: "quickstart",
    title: "Quick Start",
    icon: Terminal,
    content: `# Quick Start

## 1. Install the JOE SDK
\`\`\`bash
npm install @jettoptics/joe-sdk
\`\`\`

## 2. Initialize
\`\`\`typescript
import { JOE } from '@jettoptics/joe-sdk'

const joe = new JOE({
  apiKey: 'optx_test_****',
  network: 'devnet'
})
\`\`\`

## 3. Start Gaze Tracking
\`\`\`typescript
const session = await joe.startGazeSession()
session.onTensor((tensor) => {
  console.log(tensor) // { type: 'COG', confidence: 0.95 }
})
\`\`\`

## 4. Create Attestation
\`\`\`typescript
const attestation = await joe.createAttestation({
  gazeSignature: session.getSignature(),
  wallet: userWallet.publicKey
})
console.log(attestation.txHash) // Solana TX
\`\`\`
`,
  },
  {
    id: "gaze-auth",
    title: "Gaze Authentication",
    icon: Eye,
    content: `# Gaze Authentication (AGT)

## Overview
AGT (Augmented Gaze Tensor) authentication uses eye-tracking to generate unique biometric signatures.

## Tensor Types
- **COG** (Cognitive) - Upper gaze zone, analytical focus
- **EMO** (Emotional) - Lower-left zone, emotional processing
- **ENV** (Environmental) - Lower-right zone, spatial awareness

## JETT PIN
A polynomial gaze sequence (5 positions) that creates a unique encryption key:
1. User looks at COG/EMO/ENV zones in sequence
2. Each position is held for 800ms to confirm
3. The sequence generates a JOULE (Joule Encryption Temporal Template)
4. Template is hashed and stored on-chain as attestation

## Integration
\`\`\`typescript
import { PolynomialGazeAuth } from '@jettoptics/joe-sdk'

const auth = new PolynomialGazeAuth({
  positions: 5,
  holdThreshold: 800, // ms
  sessionNonce: await fetchNonce()
})

auth.onComplete((template) => {
  // template.hash - verification hash
  // template.polynomial - encoded positions
  // template.timestamp - creation time
})
\`\`\`
`,
  },
  {
    id: "solana",
    title: "Solana Integration",
    icon: Wallet,
    content: `# Solana Integration

## Contract Addresses
- **Program**: \`91SqqYLMi5zNsfMab6rnvipwJhDpN4FEMSLgu8F3bbGq\`
- **$OPTX Mint**: \`4r9WoPsRjJzrYEuj6VdwowVrFZaXpu16Qt6xogcmdUXC\`
- **Network**: Devnet

## $OPTX Token
The native utility token for the JETT DePIN network:
- Stake for node validation rewards
- Pay for gaze attestation fees
- Governance voting

## On-Chain Attestation
\`\`\`typescript
import { createAttestation } from '@jettoptics/joe-sdk/solana'

const tx = await createAttestation({
  wallet: publicKey,
  gazeHash: template.hash,
  tensorWeights: { cog: 0.4, emo: 0.3, env: 0.3 },
  program: '91SqqYLMi5zNsfMab6rnvipwJhDpN4FEMSLgu8F3bbGq'
})
\`\`\`

## Repos
- [JTX-CSTB.TRUST.DEPIN](https://github.com/jett22JOE/JTX-CSTB.TRUST.DEPIN) - Smart contract
- [Solana Dev Skill](https://github.com/solana-foundation/solana-dev-skill) - Best practices
`,
  },
  {
    id: "api",
    title: "API Reference",
    icon: Code,
    content: `# API Reference

## Endpoints

### POST /api/verify-session
Verify Clerk subscription status.
\`\`\`json
{ "sessionId": "optional_checkout_session_id" }
\`\`\`
Returns: \`{ status: "active"|"inactive"|"pending", tier: "string" }\`

### POST /api/hedgehog/analyze
Query Grok 4.1 via HEDGEHOG MCP for OAuth analysis.
\`\`\`json
{
  "issue_type": "oauth_redirect_loop",
  "context": { "clerk_domain": "...", "error_details": "..." }
}
\`\`\`

### POST /api/create-checkout
Create Stripe checkout session for subscription.
\`\`\`json
{ "priceId": "price_xxx", "tier": "mojo" }
\`\`\`

## SpacetimeDB (Edge)
- **Host**: 127.0.0.1:3000 (Jetson, Tailscale only)
- **Tables**: users, gaze_events, gaze_sessions, xai_api_calls

## HEDGEHOG MCP
- **Gateway**: Grok 4.1 Fast Reasoning
- **Tools**: grok_query, gaze_store, gaze_analyze, chat_completion
`,
  },
  {
    id: "security",
    title: "Security",
    icon: Shield,
    content: `# Security

## Architecture
- **Auth**: Clerk (OAuth + email, session-based)
- **Payments**: Stripe (webhook-verified subscriptions)
- **Edge**: Tailscale mesh (WireGuard encrypted, no public exposure)
- **AI**: HEDGEHOG MCP (API keys embedded server-side, never client-exposed)

## Gaze Biometrics
- Processed locally on Jetson Orin Nano (never sent to cloud)
- MediaPipe face mesh runs on-device
- Gaze signatures are one-way hashed before on-chain storage
- JOULE templates are quantum-resistant (polynomial-based)

## Key Management
- API keys: Generated server-side, hashed at rest
- Solana keys: User-controlled (Phantom wallet)
- XAI key: Embedded in HEDGEHOG MCP server (never in client code)
- Clerk keys: Environment variables on Vercel

## DePIN Node Security
- Nodes validate gaze attestations via consensus
- Stake-weighted validation (minimum 1000 $OPTX)
- Slashing for invalid attestations
`,
  },
]

export default function DocsPage() {
  const [activeDoc, setActiveDoc] = useState("quickstart")
  const [copied, setCopied] = useState(false)
  const active = docs.find((d) => d.id === activeDoc)

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex h-screen">
      {/* Doc Nav */}
      <div className="w-48 border-r border-orange-500/20 bg-zinc-950/50 p-3 space-y-1 shrink-0">
        <p className="text-[10px] text-orange-400/50 font-mono uppercase tracking-wider px-2 mb-3">Documentation</p>
        {docs.map((doc) => (
          <button
            key={doc.id}
            onClick={() => setActiveDoc(doc.id)}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-mono transition-colors text-left ${
              activeDoc === doc.id
                ? "bg-orange-500/20 text-orange-400"
                : "text-orange-400/60 hover:text-orange-400 hover:bg-orange-500/10"
            }`}
          >
            <doc.icon className="w-3.5 h-3.5 shrink-0" />
            <span>{doc.title}</span>
          </button>
        ))}
      </div>

      {/* Doc Content */}
      <div className="flex-1 overflow-auto p-8 max-w-4xl">
        {active && (
          <div className="prose prose-invert prose-orange max-w-none">
            <div className="font-mono text-orange-100/90 text-sm leading-relaxed whitespace-pre-wrap">
              {active.content.split(/(```[\s\S]*?```)/g).map((part, i) => {
                if (part.startsWith("```")) {
                  const code = part.replace(/```\w*\n?/, "").replace(/```$/, "").trim()
                  return (
                    <div key={i} className="relative my-4">
                      <button
                        onClick={() => copyCode(code)}
                        className="absolute top-2 right-2 p-1 rounded bg-zinc-700/50 hover:bg-zinc-600/50 transition-colors"
                      >
                        {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-zinc-400" />}
                      </button>
                      <pre className="bg-zinc-900/80 border border-orange-500/20 rounded-lg p-4 text-xs overflow-x-auto">
                        <code className="text-orange-200/80">{code}</code>
                      </pre>
                    </div>
                  )
                }
                return (
                  <span key={i}>
                    {part.split("\n").map((line, j) => {
                      if (line.startsWith("# ")) return <h1 key={j} className="text-2xl font-bold text-orange-400 mt-6 mb-3 font-mono">{line.slice(2)}</h1>
                      if (line.startsWith("## ")) return <h2 key={j} className="text-lg font-bold text-orange-300 mt-5 mb-2 font-mono">{line.slice(3)}</h2>
                      if (line.startsWith("### ")) return <h3 key={j} className="text-sm font-bold text-orange-200 mt-4 mb-1 font-mono">{line.slice(4)}</h3>
                      if (line.startsWith("- ")) return <div key={j} className="pl-4 py-0.5 text-orange-100/70">{line}</div>
                      if (line.trim() === "") return <div key={j} className="h-2" />
                      return <div key={j} className="text-orange-100/70">{line}</div>
                    })}
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
