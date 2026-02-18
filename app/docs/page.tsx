"use client"

import { useState } from "react"
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft, BookOpen, Code2, Wallet, Eye, Shield, Zap, Network,
  ExternalLink, Copy, Check, Terminal, Layers, Globe, ChevronRight,
  Cpu, Lock, Fingerprint, BrainCircuit
} from "lucide-react"
import Link from "next/link"

type DocTab = "overview" | "api" | "wallet" | "gaze" | "bridge" | "cstb"

const TABS: { key: DocTab; label: string; icon: typeof Code2; color: string }[] = [
  { key: "overview", label: "Overview", icon: BookOpen, color: "orange" },
  { key: "api", label: "API Reference", icon: Code2, color: "yellow" },
  { key: "gaze", label: "Gaze Verification", icon: Eye, color: "green" },
  { key: "wallet", label: "ERC-8004 Wallet", icon: Wallet, color: "blue" },
  { key: "bridge", label: "LayerZero Bridge", icon: Network, color: "purple" },
  { key: "cstb", label: "CSTB / DePIN", icon: Shield, color: "red" },
]

const ON_CHAIN = {
  DEPIN_PROGRAM: "91SqqYLMi5zNsfMab6rnvipwJhDpN4FEMSLgu8F3bbGq",
  OPTX_MINT: "4r9WoPsRjJzrYEuj6VdwowVrFZaXpu16Qt6xogcmdUXC",
  JTX_MINT: "9XpJiKEYzq5yDo5pJzRfjSRMPL2yPfDQXgiN7uYtBhUj",
  CSTB_MINT: "4waAAfTjqf5LNpj2TC5zoeiAgegVwKWoy4WiJgjdBkVL",
}

function AddressBadge({ label, addr, net }: { label: string; addr: string; net: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(addr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/20 border border-orange-500/10 hover:border-orange-500/25 transition-colors">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-zinc-300">{label}</span>
        <Badge className={`text-[8px] h-4 ${net === "mainnet" ? "bg-green-500/15 text-green-400 border-green-500/25" : "bg-yellow-500/15 text-yellow-400 border-yellow-500/25"}`}>
          {net}
        </Badge>
      </div>
      <div className="flex items-center gap-1.5">
        <code className="font-mono text-[9px] text-orange-300/80 bg-orange-500/5 px-1.5 py-0.5 rounded">
          {addr.slice(0, 6)}...{addr.slice(-4)}
        </code>
        <button onClick={copy} className="p-1 hover:bg-orange-500/15 rounded transition-colors">
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-zinc-500 hover:text-zinc-300" />}
        </button>
        <a
          href={`https://explorer.solana.com/address/${addr}?cluster=${net === "mainnet" ? "mainnet-beta" : "devnet"}`}
          target="_blank" rel="noopener noreferrer"
          className="p-1 hover:bg-orange-500/15 rounded transition-colors"
        >
          <ExternalLink className="w-3 h-3 text-zinc-500 hover:text-zinc-300" />
        </a>
      </div>
    </div>
  )
}

function CodeBlock({ code, language = "typescript" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="relative rounded-lg bg-black/60 border border-orange-500/15 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-black/40 border-b border-orange-500/10">
        <span className="font-mono text-[9px] text-zinc-500">{language}</span>
        <button onClick={copy} className="text-[9px] text-zinc-500 hover:text-orange-400 flex items-center gap-1 transition-colors">
          {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-[11px] font-mono text-orange-200/80 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function DocsContent() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState<DocTab>("overview")

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      {/* Header */}
      <div className="border-b border-orange-500/20 bg-black/40 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-orange-400 hover:text-orange-300 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h1 className="font-mono text-sm text-orange-400 tracking-widest">OPTX DEVELOPER SUITE</h1>
              <p className="font-mono text-[9px] text-zinc-500">Documentation & Tools for $OPTX Integration</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[9px]">v0.1.0</Badge>
            <Link href="/dojo">
              <Button size="sm" className="h-7 text-[10px] px-3 bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 font-mono">
                Open DOJO <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex gap-0">
        {/* Sidebar */}
        <div className="w-56 shrink-0 border-r border-orange-500/15 min-h-[calc(100vh-53px)] bg-black/20 p-3 space-y-1 sticky top-[53px] self-start">
          <p className="text-[10px] text-orange-400/50 font-mono uppercase tracking-wider px-2 mb-2">Documentation</p>
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition-colors text-left ${
                  isActive
                    ? "bg-orange-500/20 text-orange-400 border-l-2 border-orange-500"
                    : "text-orange-400/60 hover:text-orange-400 hover:bg-orange-500/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            )
          })}

          <div className="pt-4 mt-4 border-t border-orange-500/15 space-y-2">
            <p className="text-[10px] text-orange-400/50 font-mono uppercase tracking-wider px-2">Resources</p>
            <a href="https://github.com/jett22JOE/JTX-CSTB.TRUST.DEPIN" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-orange-400/60 hover:text-orange-400 hover:bg-orange-500/10 transition-colors">
              <Globe className="w-3.5 h-3.5" /> GitHub Repo <ExternalLink className="w-3 h-3 ml-auto" />
            </a>
            <a href="https://explorer.solana.com/address/91SqqYLMi5zNsfMab6rnvipwJhDpN4FEMSLgu8F3bbGq?cluster=devnet" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-orange-400/60 hover:text-orange-400 hover:bg-orange-500/10 transition-colors">
              <Layers className="w-3.5 h-3.5" /> Solana Explorer <ExternalLink className="w-3 h-3 ml-auto" />
            </a>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6 min-w-0">

          {/* ===================== OVERVIEW ===================== */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-mono text-lg text-orange-400 mb-2">Welcome to the OPTX Developer Suite</h2>
                <p className="font-mono text-xs text-zinc-400 leading-relaxed max-w-2xl">
                  Build applications with gaze-authenticated biometric verification, on-chain attestation via the CSTB Trust DePIN protocol,
                  and cross-chain token bridging. The $OPTX token powers the incentive layer for neuromorphic authentication.
                </p>
              </div>

              {/* Quick Start Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: Eye, title: "Gaze Verification", desc: "Integrate AGT biometric auth into your app with 3 tensor classification", color: "green", tab: "gaze" as DocTab },
                  { icon: Wallet, title: "Agent Wallet", desc: "ERC-8004 non-transferable wallet for computational identity", color: "blue", tab: "wallet" as DocTab },
                  { icon: Shield, title: "CSTB Attestation", desc: "On-chain proof of gaze with DePIN reward distribution", color: "purple", tab: "cstb" as DocTab },
                ].map((card) => {
                  const Icon = card.icon
                  return (
                    <button key={card.title} onClick={() => setActiveTab(card.tab)} className="text-left">
                      <Card className={`border-${card.color}-500/20 bg-gradient-to-br from-${card.color}-500/5 to-transparent hover:border-${card.color}-500/40 transition-colors cursor-pointer`}>
                        <CardContent className="p-4">
                          <Icon className={`w-6 h-6 text-${card.color}-400 mb-2`} />
                          <h3 className="font-mono text-sm text-white mb-1">{card.title}</h3>
                          <p className="font-mono text-[10px] text-zinc-500 leading-relaxed">{card.desc}</p>
                        </CardContent>
                      </Card>
                    </button>
                  )
                })}
              </div>

              {/* Architecture */}
              <Card className="border-orange-500/20 bg-black/30">
                <CardHeader className="p-4 border-b border-orange-500/15">
                  <CardTitle className="text-sm text-orange-300 flex items-center gap-2">
                    <Cpu className="w-4 h-4" /> System Architecture
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <CodeBlock language="text" code={`┌─────────────────────────────────────────────────────────┐
│  CLIENT (Next.js / React Native)                        │
│  ├── Gaze Camera Feed → MediaPipe → AGT Classification  │
│  ├── Clerk Auth (account) + Gaze Biometric (identity)   │
│  └── Phantom / OKX Wallet Connection                    │
├─────────────────────────────────────────────────────────┤
│  EDGE NODE (Jetson Orin Nano via Tailscale)              │
│  ├── JOE Agent (Matrix Bot + WebSocket RPC)             │
│  ├── SpacetimeDB (real-time state + subscriptions)      │
│  ├── HEDGEHOG MCP (Grok 4.1 + context bridge)          │
│  └── K3s Orchestration                                  │
├─────────────────────────────────────────────────────────┤
│  ON-CHAIN (Solana Devnet / Mainnet)                     │
│  ├── CSTB Trust DePIN Program (Anchor)                  │
│  ├── $OPTX Token (Token-2022 SPL)                       │
│  ├── $JTX Governance Token                              │
│  └── LayerZero OFT Bridge (Solana ↔ EVM)               │
└─────────────────────────────────────────────────────────┘`} />
                </CardContent>
              </Card>

              {/* On-Chain Addresses */}
              <Card className="border-orange-500/20 bg-black/30">
                <CardHeader className="p-4 border-b border-orange-500/15">
                  <CardTitle className="text-sm text-orange-300 flex items-center gap-2">
                    <Layers className="w-4 h-4" /> On-Chain Addresses
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <AddressBadge label="DePIN Program" addr={ON_CHAIN.DEPIN_PROGRAM} net="devnet" />
                  <AddressBadge label="$OPTX Mint" addr={ON_CHAIN.OPTX_MINT} net="devnet" />
                  <AddressBadge label="$JTX Mint" addr={ON_CHAIN.JTX_MINT} net="mainnet" />
                  <AddressBadge label="$CSTB Mint" addr={ON_CHAIN.CSTB_MINT} net="devnet" />
                </CardContent>
              </Card>
            </div>
          )}

          {/* ===================== API REFERENCE ===================== */}
          {activeTab === "api" && (
            <div className="space-y-6">
              <h2 className="font-mono text-lg text-orange-400">API Reference</h2>
              <p className="font-mono text-xs text-zinc-400 leading-relaxed">
                The OPTX API is exposed via WebSocket RPC through Tailscale Funnel, and REST endpoints on the Vercel frontend.
              </p>

              <Card className="border-orange-500/20 bg-black/30">
                <CardHeader className="p-4 border-b border-orange-500/15">
                  <CardTitle className="text-sm text-orange-300 flex items-center gap-2">
                    <Terminal className="w-4 h-4" /> WebSocket RPC (JOE Agent)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <p className="font-mono text-[10px] text-zinc-400">Connect to the JOE agent running on the Jetson Orin Nano edge node.</p>
                  <CodeBlock code={`// Connect to JOE via Tailscale Funnel
const ws = new WebSocket("wss://joe-ws.jettoptics.ai/ws/joe")

ws.onopen = () => {
  console.log("Connected to JOE Agent on Jetson")

  // Send a chat message
  ws.send(JSON.stringify({
    type: "chat",
    user: "your-username",
    content: "Hello JOE, check my gaze attestation status",
  }))
}

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  // data.content  - JOE's response text
  // data.tensor   - Current AGT classification (COG/EMO/ENV)
  // data.cstb_score - CSTB attestation score
  // data.tools_used - Array of tools JOE invoked
}`} />
                </CardContent>
              </Card>

              <Card className="border-orange-500/20 bg-black/30">
                <CardHeader className="p-4 border-b border-orange-500/15">
                  <CardTitle className="text-sm text-orange-300 flex items-center gap-2">
                    <Code2 className="w-4 h-4" /> HEDGEHOG MCP Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <p className="font-mono text-[10px] text-zinc-400">Available MCP tools via the HEDGEHOG-SPACETIME server.</p>
                  <CodeBlock language="json" code={`{
  "tools": [
    "hedgehog_grok_query",        // Query Grok 4.1 Fast with context
    "hedgehog_get_context",       // Get jOSH-spatial workspace state
    "hedgehog_store_gaze_data",   // Store COG/ENV/EMO gaze tensors
    "hedgehog_retrieve_gaze_data",// Get gaze tracking history
    "hedgehog_analyze_gaze_pattern", // AI gaze pattern analysis
    "hedgehog_chat_completion",   // Multi-model AI chat
    "hedgehog_xai_api_history",   // XAI API audit trail
    "hedgehog_xai_api_stats",     // Usage statistics
    "hedgehog_gateway"            // Direct XAI API proxy
  ]
}`} />
                </CardContent>
              </Card>

              <Card className="border-orange-500/20 bg-black/30">
                <CardHeader className="p-4 border-b border-orange-500/15">
                  <CardTitle className="text-sm text-orange-300 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> REST Endpoints
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {[
                    { method: "POST", path: "/api/create-checkout", desc: "Create Stripe checkout session for subscription" },
                    { method: "POST", path: "/api/verify-session", desc: "Verify Stripe payment and update subscription tier" },
                    { method: "POST", path: "/api/webhooks/stripe", desc: "Stripe webhook for subscription events" },
                    { method: "POST", path: "/api/webhooks/clerk", desc: "Clerk webhook for user lifecycle events" },
                  ].map((ep) => (
                    <div key={ep.path} className="flex items-center gap-3 p-2 rounded bg-black/20 border border-orange-500/10">
                      <Badge className={`text-[8px] h-4 font-mono ${ep.method === "GET" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"}`}>
                        {ep.method}
                      </Badge>
                      <code className="font-mono text-[10px] text-orange-300">{ep.path}</code>
                      <span className="font-mono text-[9px] text-zinc-500 ml-auto">{ep.desc}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ===================== GAZE VERIFICATION ===================== */}
          {activeTab === "gaze" && (
            <div className="space-y-6">
              <h2 className="font-mono text-lg text-orange-400 flex items-center gap-2">
                <Eye className="w-5 h-5" /> Gaze Verification Guide
              </h2>
              <p className="font-mono text-xs text-zinc-400 leading-relaxed max-w-2xl">
                The Adaptive Gaze Tensor (AGT) system classifies eye movement into three biometric tensors:
                Cognitive (COG), Emotional (EMO), and Environmental (ENV). These form a unique gaze signature for authentication.
              </p>

              {/* AGT Tensors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { tensor: "COG", emoji: "\u{1F9E0}", color: "oklch(0.82 0.18 95)", desc: "Upper gaze zone. Analytical focus, reading, problem-solving patterns.", border: "yellow" },
                  { tensor: "EMO", emoji: "\u{2764}\u{FE0F}", color: "oklch(0.65 0.25 25)", desc: "Lower-left zone. Emotional processing, social engagement, empathy.", border: "red" },
                  { tensor: "ENV", emoji: "\u{1F30D}", color: "oklch(0.60 0.20 250)", desc: "Lower-right zone. Spatial awareness, environmental scanning, navigation.", border: "blue" },
                ].map((t) => (
                  <Card key={t.tensor} className={`border-${t.border}-500/20 bg-gradient-to-br from-${t.border}-500/5 to-transparent`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{t.emoji}</span>
                        <span className="font-mono text-sm font-bold" style={{ color: t.color }}>{t.tensor}</span>
                      </div>
                      <p className="font-mono text-[10px] text-zinc-400 leading-relaxed">{t.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-orange-500/20 bg-black/30">
                <CardHeader className="p-4 border-b border-orange-500/15">
                  <CardTitle className="text-sm text-orange-300 flex items-center gap-2">
                    <Fingerprint className="w-4 h-4" /> Integration Example
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <CodeBlock code={`import { useGazeClassifier } from "@jettoptics/gaze-sdk"

function GazeAuth() {
  const { tensor, confidence, weights } = useGazeClassifier({
    camera: true,      // Enable webcam capture
    fps: 60,           // Classification frequency
    minConfidence: 0.7 // Minimum confidence threshold
  })

  // tensor: "COG" | "EMO" | "ENV"
  // confidence: 0.0 - 1.0
  // weights: { COG: number, EMO: number, ENV: number }

  // Store gaze data via HEDGEHOG MCP
  const attestGaze = async () => {
    await fetch("/api/hedgehog/store-gaze", {
      method: "POST",
      body: JSON.stringify({
        user_id: 1,
        gaze_x: gazePosition.x,
        gaze_y: gazePosition.y,
        cog_value: weights.COG,
        emo_value: weights.EMO,
        env_value: weights.ENV,
        confidence: confidence
      })
    })
  }
}`} />

                  <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/15">
                    <p className="font-mono text-[10px] text-green-400 flex items-center gap-2">
                      <Shield className="w-3 h-3" /> Minimum 222 centiseconds of gaze data required for CSTB attestation
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-500/20 bg-black/30">
                <CardHeader className="p-4 border-b border-orange-500/15">
                  <CardTitle className="text-sm text-orange-300 flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4" /> JETT Protocol
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <p className="font-mono text-[10px] text-zinc-400 leading-relaxed">
                    <strong className="text-orange-300">Joule Encryption Temporal Template (JETT)</strong> derives quantum-resistant encryption keys from gaze biometrics.
                    Your unique gaze pattern generates a deterministic seed that serves as a wallet signature vault.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Training Sessions", desc: "Build AGT baseline via /dojo/training" },
                      { label: "Stability Score", desc: "Analytics tracks tensor consistency" },
                      { label: "Gaze Seed", desc: "Deterministic key from weighted AGT" },
                      { label: "Vault Signing", desc: "Web3 wallet signs with gaze-derived key" },
                    ].map((item) => (
                      <div key={item.label} className="p-2 rounded bg-black/20 border border-orange-500/10">
                        <p className="font-mono text-[10px] text-orange-300 font-semibold">{item.label}</p>
                        <p className="font-mono text-[9px] text-zinc-500">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ===================== ERC-8004 WALLET ===================== */}
          {activeTab === "wallet" && (
            <div className="space-y-6">
              <h2 className="font-mono text-lg text-orange-400 flex items-center gap-2">
                <Wallet className="w-5 h-5" /> ERC-8004 Agent Wallet
              </h2>
              <p className="font-mono text-xs text-zinc-400 leading-relaxed max-w-2xl">
                The OPTX Agent Wallet implements a non-transferable, soulbound identity bound to gaze biometrics.
                Unlike standard wallets, the ERC-8004 interface links computational proof to the holder's identity.
              </p>

              <Card className="border-blue-500/20 bg-black/30">
                <CardHeader className="p-4 border-b border-blue-500/15">
                  <CardTitle className="text-sm text-blue-300 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Wallet Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <CodeBlock code={`// Connect Phantom or OKX wallet
import { useWallet } from "@solana/wallet-adapter-react"

function OPTXWallet() {
  const { publicKey, signTransaction } = useWallet()

  // Mint $OPTX on devnet
  const mintOPTX = async () => {
    const mint = new PublicKey("${ON_CHAIN.OPTX_MINT}")
    const program = new PublicKey("${ON_CHAIN.DEPIN_PROGRAM}")

    // Call DePIN program to mint tokens
    // Requires valid CSTB attestation (min 2/5 sessions)
    const tx = await program.methods
      .mintOptxReward({ amount: new BN(1000) })
      .accounts({
        authority: publicKey,
        optxMint: mint,
        userTokenAccount: ata,
      })
      .transaction()

    await signTransaction(tx)
  }
}`} />
                </CardContent>
              </Card>

              <Card className="border-blue-500/20 bg-black/30">
                <CardHeader className="p-4 border-b border-blue-500/15">
                  <CardTitle className="text-sm text-blue-300 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Agent Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <p className="font-mono text-[10px] text-zinc-400 leading-relaxed">
                    Each OPTX Agent Wallet carries metadata that includes CSTB profile URI, gaze attestation hash, and AGT baseline weights.
                  </p>
                  <CodeBlock language="json" code={`{
  "agent_wallet": {
    "type": "ERC-8004",
    "soulbound": true,
    "metadata": {
      "cstb_profile_uri": "https://jettoptics.ai/cstb/profile/...",
      "gaze_attestation_hash": "0x...",
      "agt_baseline": { "COG": 42, "EMO": 31, "ENV": 27 },
      "min_gaze_cs": 222,
      "entropy": 750,
      "difficulty": 1000
    }
  }
}`} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* ===================== LAYERZERO BRIDGE ===================== */}
          {activeTab === "bridge" && (
            <div className="space-y-6">
              <h2 className="font-mono text-lg text-orange-400 flex items-center gap-2">
                <Network className="w-5 h-5" /> LayerZero Bridge
              </h2>
              <p className="font-mono text-xs text-zinc-400 leading-relaxed max-w-2xl">
                Bridge $OPTX between Solana and EVM chains using the LayerZero Omnichain Fungible Token (OFT) standard.
                This enables cross-chain DePIN reward distribution and multi-chain wallet verification.
              </p>

              <Card className="border-purple-500/20 bg-black/30">
                <CardHeader className="p-4 border-b border-purple-500/15">
                  <CardTitle className="text-sm text-purple-300 flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Bridge Architecture
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <CodeBlock language="text" code={`Solana ($OPTX SPL Token-2022)
  │
  ├── LayerZero Endpoint (Solana)
  │     └── OFT Adapter Program
  │
  ├── ─ ─ ─ LayerZero DVN Verification ─ ─ ─ ─
  │
  ├── LayerZero Endpoint (EVM)
  │     └── OFT Contract (ERC-20 wrapped $OPTX)
  │
  └── Supported Chains:
      ├── Ethereum Mainnet
      ├── Base
      ├── Arbitrum
      └── Polygon`} />
                </CardContent>
              </Card>

              <Card className="border-purple-500/20 bg-black/30">
                <CardHeader className="p-4 border-b border-purple-500/15">
                  <CardTitle className="text-sm text-purple-300 flex items-center gap-2">
                    <Code2 className="w-4 h-4" /> Bridge Example
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <CodeBlock code={`// Bridge $OPTX from Solana to Base
import { OftTools } from "@layerzerolabs/lz-solana-sdk-v2"

const bridgeToEVM = async (amount: number, evmAddress: string) => {
  const oftConfig = {
    srcEid: 40168,           // Solana endpoint ID
    dstEid: 40245,           // Base endpoint ID
    tokenMint: "${ON_CHAIN.OPTX_MINT}",
  }

  const tx = await OftTools.send(
    connection,
    wallet.publicKey,
    oftConfig,
    amount,
    evmAddress,     // Destination EVM address
    { nativeFee }   // LayerZero messaging fee
  )

  await wallet.signAndSendTransaction(tx)
}`} />
                </CardContent>
              </Card>

              <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/15">
                <p className="font-mono text-[10px] text-yellow-400 flex items-center gap-2">
                  <Zap className="w-3 h-3" /> LayerZero bridge is currently in devnet testing. Mainnet deployment pending audit.
                </p>
              </div>
            </div>
          )}

          {/* ===================== CSTB / DePIN ===================== */}
          {activeTab === "cstb" && (
            <div className="space-y-6">
              <h2 className="font-mono text-lg text-orange-400 flex items-center gap-2">
                <Shield className="w-5 h-5" /> CSTB Trust DePIN Protocol
              </h2>
              <p className="font-mono text-xs text-zinc-400 leading-relaxed max-w-2xl">
                CompuStable (CSTB) is the on-chain attestation layer that verifies gaze biometric proofs.
                The DePIN (Decentralized Physical Infrastructure Network) distributes $OPTX rewards to validated gaze sessions.
              </p>

              <Card className="border-red-500/20 bg-black/30">
                <CardHeader className="p-4 border-b border-red-500/15">
                  <CardTitle className="text-sm text-red-300 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Reward Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { pct: "60%", label: "Provider", desc: "User who contributes gaze data", color: "green" },
                      { pct: "30%", label: "Client", desc: "Application requesting verification", color: "blue" },
                      { pct: "10%", label: "Protocol", desc: "CSTB treasury for operations", color: "orange" },
                    ].map((r) => (
                      <div key={r.label} className={`p-3 rounded-lg bg-${r.color}-500/5 border border-${r.color}-500/15 text-center`}>
                        <p className={`font-mono text-xl font-bold text-${r.color}-400`}>{r.pct}</p>
                        <p className="font-mono text-xs text-white mt-1">{r.label}</p>
                        <p className="font-mono text-[9px] text-zinc-500 mt-0.5">{r.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-500/20 bg-black/30">
                <CardHeader className="p-4 border-b border-red-500/15">
                  <CardTitle className="text-sm text-red-300 flex items-center gap-2">
                    <Terminal className="w-4 h-4" /> Attestation Flow
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <CodeBlock language="text" code={`1. User starts gaze training session in DOJO
2. Camera captures eye movement at 60fps
3. MediaPipe classifies gaze → AGT tensors (COG/EMO/ENV)
4. Minimum 222cs of data collected (quality threshold)
5. HEDGEHOG MCP stores tensors in SpacetimeDB
6. JOE Agent validates session integrity
7. CSTB program on Solana creates attestation PDA
8. $OPTX minted to user's wallet (60% of reward pool)
9. Attestation hash stored on-chain for future verification

Requirements:
  - Min gaze duration: 222 centiseconds
  - Min entropy: 750
  - Difficulty target: 1000
  - AGT constraint: COG + EMO + ENV = 10,000 (normalized)`} />
                </CardContent>
              </Card>

              <Card className="border-red-500/20 bg-black/30">
                <CardHeader className="p-4 border-b border-red-500/15">
                  <CardTitle className="text-sm text-red-300 flex items-center gap-2">
                    <Code2 className="w-4 h-4" /> Anchor Program
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <CodeBlock language="rust" code={`use anchor_lang::prelude::*;

#[program]
pub mod cstb_depin {
    use super::*;

    pub fn create_attestation(
        ctx: Context<CreateAttestation>,
        gaze_hash: [u8; 32],
        agt_weights: [u16; 3],  // [COG, EMO, ENV]
        gaze_duration_cs: u32,
        entropy: u16,
    ) -> Result<()> {
        require!(gaze_duration_cs >= 222, CSTBError::InsufficientGaze);
        require!(entropy >= 750, CSTBError::InsufficientEntropy);
        require!(
            agt_weights.iter().sum::<u16>() == 10_000,
            CSTBError::InvalidAGTWeights
        );

        let attestation = &mut ctx.accounts.attestation;
        attestation.authority = ctx.accounts.user.key();
        attestation.gaze_hash = gaze_hash;
        attestation.agt_weights = agt_weights;
        attestation.timestamp = Clock::get()?.unix_timestamp;
        attestation.verified = true;

        Ok(())
    }
}`} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DocsPage() {
  return (
    <>
      <SignedIn>
        <DocsContent />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}
