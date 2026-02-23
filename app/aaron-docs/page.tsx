"use client"

import { useState, useEffect } from "react"
import { Eye, Shield, Zap, Layers, Copy, Check, ExternalLink, Sun, Moon, Terminal, Globe, Fingerprint, Code2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background"

const ON_CHAIN = {
  DEPIN_PROGRAM: "91SqqYLMi5zNsfMab6rnvipwJhDpN4FEMSLgu8F3bbGq",
  OPTX_MINT: "4r9WoPsRjJzrYEuj6VdwowVrFZaXpu16Qt6xogcmdUXC",
  JTX_MINT: "9XpJiKEYzq5yDo5pJzRfjSRMPL2yPfDQXgiN7uYtBhUj",
  CSTB_MINT: "4waAAfTjqf5LNpj2TC5zoeiAgegVwKWoy4WiJgjdBkVL",
}

function CodeBlock({ code, language, theme }: { code: string; language: string; theme: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="relative group">
      <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
        <span className="font-mono text-[8px] text-zinc-500 uppercase">{language}</span>
        <button onClick={copy} className="p-1 rounded hover:bg-white/10 transition-colors">
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-zinc-500" />}
        </button>
      </div>
      <pre className="bg-zinc-950 border border-zinc-800/50 rounded-lg p-4 pt-8 overflow-x-auto">
        <code className="font-mono text-[11px] leading-relaxed text-zinc-300 whitespace-pre">{code}</code>
      </pre>
    </div>
  )
}

function AddressBadge({ label, addr, net }: { label: string; addr: string; net: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(addr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800/50 bg-zinc-950/50 hover:border-orange-500/20 transition-colors">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[11px] text-zinc-300">{label}</span>
        <span className={`font-mono text-[8px] px-1.5 py-0.5 rounded ${net === "mainnet" ? "bg-green-500/15 text-green-400 border border-green-500/25" : "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25"}`}>
          {net}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <code className="font-mono text-[9px] text-orange-300/70">{addr.slice(0, 4)}...{addr.slice(-4)}</code>
        <button onClick={copy} className="p-1 rounded hover:bg-white/10 transition-colors">
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-zinc-500" />}
        </button>
      </div>
    </div>
  )
}

export default function AaronDocsPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  useEffect(() => {
    const saved = localStorage.getItem("dojo-theme") as "dark" | "light" | null
    if (saved) setTheme(saved)
    const handler = (e: Event) => setTheme((e as CustomEvent).detail)
    window.addEventListener("dojo-theme-change", handler)
    return () => window.removeEventListener("dojo-theme-change", handler)
  }, [])

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    localStorage.setItem("dojo-theme", next)
    window.dispatchEvent(new CustomEvent("dojo-theme-change", { detail: next }))
  }

  const isDark = theme === "dark"

  return (
    <div className={`min-h-screen ${isDark ? "bg-zinc-950 text-white" : "bg-stone-50 text-zinc-900"} transition-colors`}>
      <DottedGlowBackground
        dotColor={isDark ? "rgba(234,88,12,0.35)" : "rgba(234,88,12,0.2)"}
        glowColor={isDark ? "rgba(234,88,12,0.8)" : "rgba(234,88,12,0.5)"}
        dotRadius={1.5}
        gap={14}
        style={{ opacity: isDark ? 0.7 : 0.4, position: "fixed", inset: 0, zIndex: 0 }}
      />

      {/* ═══ Header ═══ */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 pt-4">
        <nav className={`relative flex items-center justify-between px-4 py-3 md:px-6 md:py-4 rounded-2xl backdrop-blur-xl border ${isDark ? "bg-zinc-950/80 border-zinc-800/50" : "bg-white/80 border-zinc-200/50"}`}>
          {/* Left: Logo */}
          <Link href="/" className="group flex items-center gap-2">
            <div className="relative w-7 h-7 flex items-center justify-center">
              <span className="relative flex h-full w-full">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-50" />
                <Image
                  src="/images/astroknots-logo.png"
                  alt="Astro Knots"
                  width={28}
                  height={28}
                  className="relative inline-flex rounded-full object-contain"
                />
              </span>
            </div>
            <span className={`font-mono text-xs tracking-widest ${isDark ? "text-white/60" : "text-zinc-500"}`}>
              <span className="text-orange-500 font-bold">ASTRO</span> KNOTS
            </span>
          </Link>

          {/* Center: Nav Pills (Desktop) */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
            <ul className="flex items-center gap-1">
              {[
                { label: "Docs", href: "#", active: true },
                { label: "Aaron API", href: "#quick-start" },
                { label: "JOE AI", href: "https://jettoptics.ai/#joe-agent" },
                { label: "Contact", href: "https://x.com/jettoptx", external: true },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className={`group relative font-mono text-[11px] tracking-wider px-3 py-2 rounded-lg transition-all duration-200 ${
                      link.active
                        ? isDark ? "text-orange-400 bg-orange-500/10" : "text-orange-600 bg-orange-50"
                        : isDark ? "text-white/40 hover:text-white hover:bg-white/5" : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
                    }`}
                  >
                    {link.label}
                    {link.external && <ExternalLink className="w-2.5 h-2.5 inline ml-1 opacity-50" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-zinc-100"}`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-zinc-400" /> : <Moon className="w-4 h-4 text-zinc-500" />}
          </button>
        </nav>
      </header>

      {/* ═══ Hero ═══ */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 pt-28 pb-24">

        <section className="mb-20">
          <div className="flex items-center gap-2 mb-4">
            <Fingerprint className="w-5 h-5 text-orange-500" />
            <span className={`font-mono text-[10px] tracking-widest uppercase ${isDark ? "text-orange-400/60" : "text-orange-600/60"}`}>
              Developer Documentation
            </span>
          </div>

          <h1 className={`font-mono text-2xl md:text-3xl font-bold leading-tight mb-4 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Aaron: Edge-First Agentic Router<br />
            <span className="text-orange-500">for Web4</span>
          </h1>

          <p className={`font-mono text-sm leading-relaxed max-w-xl mb-8 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            Secure biometric auth + x402 payments. Private compute on edge hardware, public attestations on Solana.
          </p>

          <CodeBlock
            theme={theme}
            language="bash"
            code={`curl https://api.astroknots.space/aaron \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "register jettoptx.dev",
    "gaze": "MEDIUM",
    "x402": "0.05 OPTX"
  }'`}
          />
        </section>

        {/* ═══ How It Works ═══ */}
        <section className="mb-20">
          <h2 className={`font-mono text-lg font-bold mb-6 ${isDark ? "text-white" : "text-zinc-900"}`}>
            How it works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                icon: Eye,
                title: "Private gaze audit",
                desc: "AARON captures biometric tensors on-device. Raw iris data never leaves the edge node.",
                color: "text-emerald-400",
              },
              {
                icon: Shield,
                title: "Opaque proof to Solana",
                desc: "A 32-byte hash is submitted on-chain. Validators confirm the proof without seeing biometric data.",
                color: "text-blue-400",
              },
              {
                icon: Zap,
                title: "x402 unlocks action",
                desc: "Payment attestation triggers domain registration, NFT mint, or agent delegation via micropayment.",
                color: "text-yellow-400",
              },
              {
                icon: Layers,
                title: "Staked tiers via Layer 3",
                desc: "$OPTX staking determines access tiers. Higher stake = lower x402 fees + priority compute.",
                color: "text-purple-400",
              },
            ].map((card) => (
              <div
                key={card.title}
                className={`p-4 rounded-lg border transition-colors ${
                  isDark ? "border-zinc-800/50 bg-zinc-900/30 hover:border-orange-500/20" : "border-zinc-200 bg-white/60 hover:border-orange-300/50"
                }`}
              >
                <card.icon className={`w-5 h-5 ${card.color} mb-3`} />
                <h3 className={`font-mono text-sm font-bold mb-1 ${isDark ? "text-white" : "text-zinc-900"}`}>{card.title}</h3>
                <p className={`font-mono text-[10px] leading-relaxed ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ Quick Start ═══ */}
        <section id="quick-start" className="mb-20 scroll-mt-24">
          <h2 className={`font-mono text-lg font-bold mb-6 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Quick Start
          </h2>

          <div className="space-y-4">
            <div>
              <p className={`font-mono text-[10px] uppercase tracking-widest mb-2 ${isDark ? "text-orange-400/50" : "text-orange-600/50"}`}>TypeScript</p>
              <CodeBlock
                theme={theme}
                language="typescript"
                code={`import { Aaron } from "@astroknots/sdk";

const aaron = new Aaron({ endpoint: "https://api.astroknots.space" });
const proof = await aaron.attest({ gaze: "MEDIUM", x402: "0.05 OPTX" });
console.log(proof.txSignature); // Solana transaction hash`}
              />
            </div>

            <div>
              <p className={`font-mono text-[10px] uppercase tracking-widest mb-2 ${isDark ? "text-orange-400/50" : "text-orange-600/50"}`}>Python</p>
              <CodeBlock
                theme={theme}
                language="python"
                code={`from astroknots import Aaron

aaron = Aaron(endpoint="https://api.astroknots.space")
proof = aaron.attest(gaze="MEDIUM", x402="0.05 OPTX")
print(proof.tx_signature)  # Solana transaction hash`}
              />
            </div>

            <div>
              <p className={`font-mono text-[10px] uppercase tracking-widest mb-2 ${isDark ? "text-orange-400/50" : "text-orange-600/50"}`}>Response</p>
              <CodeBlock
                theme={theme}
                language="json"
                code={`{
  "status": "attested",
  "proof_hash": "9f86d08...c150e04",
  "tx_signature": "5KtR7g...xvN2mQ",
  "tier": "PIONEER",
  "x402_settled": true,
  "timestamp": "2026-02-22T08:30:00Z"
}`}
              />
            </div>
          </div>
        </section>

        {/* ═══ On-Chain Addresses ═══ */}
        <section className="mb-20">
          <h2 className={`font-mono text-lg font-bold mb-6 ${isDark ? "text-white" : "text-zinc-900"}`}>
            On-Chain Addresses
          </h2>

          <div className="space-y-2">
            <AddressBadge label="$OPTX Token" addr={ON_CHAIN.OPTX_MINT} net="mainnet" />
            <AddressBadge label="$JTX Token" addr={ON_CHAIN.JTX_MINT} net="mainnet" />
            <AddressBadge label="$CSTB Token" addr={ON_CHAIN.CSTB_MINT} net="mainnet" />
            <AddressBadge label="DePIN Program" addr={ON_CHAIN.DEPIN_PROGRAM} net="devnet" />
          </div>
        </section>

        {/* ═══ Architecture ═══ */}
        <section className="mb-20">
          <h2 className={`font-mono text-lg font-bold mb-6 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Architecture
          </h2>

          <div className={`p-4 rounded-lg border ${isDark ? "border-zinc-800/50 bg-zinc-900/30" : "border-zinc-200 bg-white/60"}`}>
            <pre className={`font-mono text-[10px] leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{`
  Client (Browser/iOS)
       │
       ▼
  ┌─────────────┐
  │  AARON Edge  │  ← Biometric capture + classification
  │   Router     │  ← x402 payment verification
  └──────┬──────┘
         │
    ┌────┴────┐
    ▼         ▼
  Edge DB   Solana
  (private) (public)
    │         │
    ▼         ▼
  Gaze     32-byte
  tensors  attestation
  (COG/    proof
   EMO/
   ENV)
            `}</pre>
          </div>
        </section>

      </main>

      {/* ═══ Footer ═══ */}
      <footer className={`relative z-10 border-t ${isDark ? "border-zinc-800/50" : "border-zinc-200"}`}>
        <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className={`font-mono text-[10px] ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
            Built by <Link href="https://jettoptics.ai" className="text-orange-500 hover:underline">Jett Optics.ai</Link>. 100% in-house. No external frameworks.
          </p>
          <div className="flex items-center gap-4">
            <Link href="https://jettoptics.ai" className={`font-mono text-[10px] transition-colors ${isDark ? "text-zinc-500 hover:text-orange-400" : "text-zinc-400 hover:text-orange-600"}`}>
              <Globe className="w-3.5 h-3.5 inline mr-1" />jettoptics.ai
            </Link>
            <Link href="https://x.com/jettoptx" target="_blank" rel="noopener noreferrer" className={`font-mono text-[10px] transition-colors ${isDark ? "text-zinc-500 hover:text-orange-400" : "text-zinc-400 hover:text-orange-600"}`}>
              @jettoptx
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
