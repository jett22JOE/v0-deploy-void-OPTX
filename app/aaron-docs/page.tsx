"use client"

import { useState, useEffect, useRef } from "react"
import {
  Eye, Shield, Zap, Layers, Copy, Check, ExternalLink, Sun, Moon,
  Terminal, Globe, Fingerprint, Code2, ChevronRight, Cpu,
  PanelLeftClose, PanelLeft, BookOpen, ArrowRight
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background"

const ON_CHAIN = {
  DEPIN_PROGRAM: "91SqqYLMi5zNsfMab6rnvipwJhDpN4FEMSLgu8F3bbGq",
  OPTX_MINT: "4r9WoPsRjJzrYEuj6VdwowVrFZaXpu16Qt6xogcmdUXC",
  JTX_MINT: "9XpJiKEYzq5yDo5pJzRfjSRMPL2yPfDQXgiN7uYtBhUj",
  CSTB_MINT: "4waAAfTjqf5LNpj2TC5zoeiAgegVwKWoy4WiJgjdBkVL",
}

type DocSection = "overview" | "how-it-works" | "quick-start" | "on-chain" | "architecture"

const SECTIONS: { key: DocSection; label: string; icon: typeof BookOpen; tocItems: string[] }[] = [
  { key: "overview", label: "Overview", icon: BookOpen, tocItems: ["AARON Overview", "Core Principles"] },
  { key: "how-it-works", label: "How It Works", icon: Cpu, tocItems: ["Private Gaze Audit", "Opaque Proof", "x402 Payments", "Staked Tiers"] },
  { key: "quick-start", label: "Quick Start", icon: Code2, tocItems: ["TypeScript SDK", "Python SDK", "Response Shape"] },
  { key: "on-chain", label: "On-Chain", icon: Layers, tocItems: ["Token Addresses", "Explorer Links"] },
  { key: "architecture", label: "Architecture", icon: Terminal, tocItems: ["System Diagram"] },
]

function CodeBlock({ code, language, theme }: { code: string; language: string; theme: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const isDark = theme === "dark"
  return (
    <div className={`relative rounded-lg border overflow-hidden ${isDark ? "bg-black/60 border-orange-500/15" : "bg-zinc-900 border-zinc-300/50"}`}>
      <div className={`flex items-center justify-between px-3 py-1.5 border-b ${isDark ? "bg-black/40 border-orange-500/10" : "bg-zinc-800 border-zinc-700/50"}`}>
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

function AddressBadge({ label, addr, net, theme }: { label: string; addr: string; net: string; theme: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(addr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const isDark = theme === "dark"
  return (
    <div className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${isDark ? "bg-black/20 border-orange-500/10 hover:border-orange-500/25" : "bg-white/60 border-orange-300/30 hover:border-orange-400/50"}`}>
      <div className="flex items-center gap-2">
        <span className={`font-mono text-[10px] ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>{label}</span>
        <span className={`font-mono text-[8px] px-1.5 py-0.5 rounded ${net === "mainnet" ? "bg-green-500/15 text-green-400 border border-green-500/25" : "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25"}`}>
          {net}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <code className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${isDark ? "text-orange-300/80 bg-orange-500/5" : "text-orange-600 bg-orange-100/50"}`}>
          {addr.slice(0, 6)}...{addr.slice(-4)}
        </code>
        <button onClick={copy} className="p-1 hover:bg-orange-500/15 rounded transition-colors">
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className={`w-3 h-3 ${isDark ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-400 hover:text-zinc-600"}`} />}
        </button>
        <a
          href={`https://explorer.solana.com/address/${addr}?cluster=${net === "mainnet" ? "mainnet-beta" : "devnet"}`}
          target="_blank" rel="noopener noreferrer"
          className="p-1 hover:bg-orange-500/15 rounded transition-colors"
        >
          <ExternalLink className={`w-3 h-3 ${isDark ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-400 hover:text-zinc-600"}`} />
        </a>
      </div>
    </div>
  )
}

export default function AaronDocsPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [activeSection, setActiveSection] = useState<DocSection>("overview")
  const [activeTocItem, setActiveTocItem] = useState("")
  const [collapsed, setCollapsed] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem("dojo-theme") as "dark" | "light" | null
    if (saved) setTheme(saved)
    const savedCollapsed = localStorage.getItem("aaron-docs-sidebar-collapsed")
    if (savedCollapsed === "true") setCollapsed(true)
    const handler = (e: Event) => setTheme((e as CustomEvent).detail)
    window.addEventListener("dojo-theme-change", handler)
    return () => window.removeEventListener("dojo-theme-change", handler)
  }, [])

  useEffect(() => {
    localStorage.setItem("aaron-docs-sidebar-collapsed", String(collapsed))
  }, [collapsed])

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    localStorage.setItem("dojo-theme", next)
    window.dispatchEvent(new CustomEvent("dojo-theme-change", { detail: next }))
  }

  // Scroll tracking for TOC
  useEffect(() => {
    const container = contentRef.current
    if (!container) return
    const handleScroll = () => {
      const headings = container.querySelectorAll("[data-section]")
      let current = ""
      headings.forEach((heading) => {
        const el = heading as HTMLElement
        const rect = el.getBoundingClientRect()
        if (rect.top <= 140) {
          current = el.getAttribute("data-section") || ""
        }
      })
      setActiveTocItem(current)
    }
    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [activeSection])

  useEffect(() => {
    setActiveTocItem("")
  }, [activeSection])

  const scrollToSection = (section: string) => {
    const container = contentRef.current
    if (!container) return
    const el = container.querySelector(`[data-section="${section}"]`)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const isDark = theme === "dark"
  const activeSectionConfig = SECTIONS.find((s) => s.key === activeSection)!

  return (
    <div className={`min-h-screen relative ${isDark ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black" : "bg-gradient-to-br from-orange-50/50 via-white to-zinc-50"}`}>
      {/* Dotted glow background — fixed full viewport */}
      <DottedGlowBackground
        className="pointer-events-none z-0 !fixed"
        opacity={isDark ? 0.7 : 0.4}
        gap={14}
        radius={1.5}
        color={isDark ? "rgba(181, 82, 0, 0.35)" : "rgba(181, 82, 0, 0.2)"}
        glowColor={isDark ? "rgba(181, 82, 0, 0.8)" : "rgba(181, 82, 0, 0.5)"}
        darkColor={isDark ? "rgba(181, 82, 0, 0.35)" : "rgba(181, 82, 0, 0.2)"}
        darkGlowColor={isDark ? "rgba(181, 82, 0, 0.8)" : "rgba(181, 82, 0, 0.5)"}
        backgroundOpacity={0}
        speedMin={0.2}
        speedMax={0.6}
        speedScale={0.7}
      />

      {/* ═══ Header — sticky top bar ═══ */}
      <div className={`border-b backdrop-blur sticky top-0 z-20 ${isDark ? "border-orange-500/20 bg-black/60" : "border-orange-200/40 bg-white/80"}`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="https://jettoptics.ai" className="flex items-center gap-2 group">
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
              <span className={`font-mono text-xs tracking-widest ${isDark ? "text-white/50" : "text-zinc-500"}`}>
                <span className="text-orange-500 font-bold">JETT</span> Optics
              </span>
            </Link>
            <div className={`h-5 w-px ${isDark ? "bg-orange-500/20" : "bg-orange-200/40"}`} />
            <div>
              <h1 className={`font-mono text-sm tracking-widest ${isDark ? "text-orange-400" : "text-orange-700"}`}>AARON DOCS</h1>
              <p className={`font-mono text-[9px] ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>Edge-First Agentic Router for Web4</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Nav pills (desktop) */}
            <div className="hidden md:flex items-center gap-1 mr-2">
              {[
                { label: "Docs", href: "#", active: true },
                { label: "Status", href: "/status" },
                { label: "Vault", href: "/" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`font-mono text-[10px] tracking-wider px-2.5 py-1.5 rounded-md transition-all ${
                    link.active
                      ? isDark ? "text-orange-400 bg-orange-500/15" : "text-orange-700 bg-orange-100/80"
                      : isDark ? "text-zinc-500 hover:text-orange-400 hover:bg-orange-500/8" : "text-zinc-400 hover:text-orange-700 hover:bg-orange-100/50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-md transition-colors ${isDark ? "hover:bg-orange-500/10" : "hover:bg-orange-100"}`}
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-orange-400/60 hover:text-orange-400" />
              ) : (
                <Moon className="w-4 h-4 text-orange-500/60 hover:text-orange-600" />
              )}
            </button>
            <a
              href="https://x.com/jettoptx"
              target="_blank"
              rel="noopener noreferrer"
              className={`font-mono text-[10px] px-2.5 py-1.5 rounded-md transition-colors ${isDark ? "text-zinc-500 hover:text-orange-400 hover:bg-orange-500/8" : "text-zinc-400 hover:text-orange-700 hover:bg-orange-100/50"}`}
            >
              @jettoptx <ExternalLink className="w-2.5 h-2.5 inline ml-0.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex gap-0 relative z-10">
        {/* ═══ Collapsible Sidebar ═══ */}
        <div className={`${collapsed ? "w-[72px]" : "w-56"} shrink-0 border-r min-h-[calc(100vh-53px)] flex flex-col sticky top-[53px] self-start transition-all duration-300 ease-in-out ${isDark ? "border-orange-500/15 bg-black/20 backdrop-blur-sm" : "border-orange-200/30 bg-white/40 backdrop-blur-sm"}`}>
          {/* Logo + collapse toggle */}
          <div className={`${collapsed ? "px-3 py-3" : "p-3"} border-b flex ${collapsed ? "flex-col items-center gap-2" : "items-center justify-between"} ${isDark ? "border-orange-500/15" : "border-orange-200/30"}`}>
            <Link href="/" className="flex items-center gap-2 group">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isDark ? "bg-orange-500/15 group-hover:bg-orange-500/25" : "bg-orange-100 group-hover:bg-orange-200"}`}>
                <Image
                  src="/images/astroknots-logo.png"
                  alt="AARON"
                  width={20}
                  height={20}
                  className="rounded-full object-contain"
                />
              </div>
              {!collapsed && (
                <div className="flex flex-col">
                  <span className={`text-sm font-bold font-mono tracking-wider ${isDark ? "text-orange-400" : "text-orange-700"}`}>AARON</span>
                  <span className={`text-[9px] font-mono ${isDark ? "text-orange-500/50" : "text-orange-500/60"}`}>Public Docs</span>
                </div>
              )}
            </Link>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`p-1.5 rounded-md transition-colors ${isDark ? "hover:bg-orange-500/10" : "hover:bg-orange-100"}`}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <PanelLeft className={`w-3.5 h-3.5 ${isDark ? "text-orange-400/60 hover:text-orange-400" : "text-orange-500/60 hover:text-orange-600"}`} />
              ) : (
                <PanelLeftClose className={`w-3.5 h-3.5 ${isDark ? "text-orange-400/60 hover:text-orange-400" : "text-orange-500/60 hover:text-orange-600"}`} />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
            {!collapsed && (
              <p className={`text-[9px] font-mono uppercase tracking-widest px-3 mb-2 mt-1 ${isDark ? "text-orange-400/40" : "text-orange-700/60"}`}>Documentation</p>
            )}
            {SECTIONS.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.key
              return (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  title={collapsed ? section.label : undefined}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition-all duration-200 text-left ${
                    collapsed ? "justify-center" : ""
                  } ${
                    isActive
                      ? isDark
                        ? "bg-orange-500/15 text-orange-400 shadow-[inset_0_0_12px_rgba(181,82,0,0.08)]"
                        : "bg-orange-100/80 text-orange-700"
                      : isDark
                        ? "text-orange-400/50 hover:text-orange-400 hover:bg-orange-500/8"
                        : "text-orange-700/60 hover:text-orange-700 hover:bg-orange-100/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? (isDark ? "text-orange-400" : "text-orange-700") : (isDark ? "text-orange-400/50" : "text-orange-700/60")}`} />
                  {!collapsed && <span>{section.label}</span>}
                </button>
              )
            })}
          </nav>

          {/* Footer links */}
          <div className={`p-2 border-t space-y-0.5 ${isDark ? "border-orange-500/15" : "border-orange-200/30"}`}>
            {!collapsed && (
              <p className={`text-[9px] font-mono uppercase tracking-widest px-3 mb-1 ${isDark ? "text-orange-400/40" : "text-orange-700/60"}`}>Resources</p>
            )}
            <a href="https://github.com/jett22JOE/JTX-CSTB.TRUST.DEPIN" target="_blank" rel="noopener noreferrer"
              title={collapsed ? "GitHub" : undefined}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition-colors ${collapsed ? "justify-center" : ""} ${isDark ? "text-orange-400/50 hover:text-orange-400 hover:bg-orange-500/8" : "text-orange-700/60 hover:text-orange-700 hover:bg-orange-100/50"}`}>
              <Globe className="w-4 h-4 shrink-0" />
              {!collapsed && <><span>GitHub</span><ExternalLink className="w-3 h-3 ml-auto" /></>}
            </a>
            <a href="https://explorer.solana.com/address/91SqqYLMi5zNsfMab6rnvipwJhDpN4FEMSLgu8F3bbGq?cluster=devnet" target="_blank" rel="noopener noreferrer"
              title={collapsed ? "Explorer" : undefined}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition-colors ${collapsed ? "justify-center" : ""} ${isDark ? "text-orange-400/50 hover:text-orange-400 hover:bg-orange-500/8" : "text-orange-700/60 hover:text-orange-700 hover:bg-orange-100/50"}`}>
              <Layers className="w-4 h-4 shrink-0" />
              {!collapsed && <><span>Explorer</span><ExternalLink className="w-3 h-3 ml-auto" /></>}
            </a>
            <Link href="/status"
              title={collapsed ? "Status" : undefined}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition-colors ${collapsed ? "justify-center" : ""} ${isDark ? "text-orange-400/50 hover:text-orange-400 hover:bg-orange-500/8" : "text-orange-700/60 hover:text-orange-700 hover:bg-orange-100/50"}`}>
              <Cpu className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Status</span>}
            </Link>
          </div>
        </div>

        {/* ═══ Main Content ═══ */}
        <div ref={contentRef} className="flex-1 p-6 space-y-6 min-w-0 overflow-auto max-h-[calc(100vh-53px)]">

          {/* ═══ OVERVIEW ═══ */}
          {activeSection === "overview" && (
            <div className="space-y-6">
              <div data-section="AARON Overview">
                <div className="flex items-center gap-2 mb-3">
                  <Fingerprint className={`w-5 h-5 ${isDark ? "text-orange-400" : "text-orange-600"}`} />
                  <span className={`font-mono text-[10px] tracking-widest uppercase ${isDark ? "text-orange-400/60" : "text-orange-700/60"}`}>
                    Developer Documentation
                  </span>
                </div>
                <h2 className={`font-mono text-xl font-bold leading-tight mb-3 ${isDark ? "text-white" : "text-zinc-900"}`}>
                  Aaron: Edge-First Agentic Router<br />
                  <span className={isDark ? "text-orange-400" : "text-orange-600"}>for Web4</span>
                </h2>
                <p className={`font-mono text-xs leading-relaxed max-w-2xl mb-6 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                  Secure biometric auth + x402 payments. Private compute on edge hardware, public attestations on Solana.
                </p>
                <CodeBlock
                  theme={theme}
                  language="bash"
                  code={`curl https://api.astroknots.space/aaron \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "register",
    "gaze": "MEDIUM",
    "x402": "0.05 OPTX"
  }'`}
                />
              </div>

              <div data-section="Core Principles" className="scroll-mt-4">
                <h3 className={`font-mono text-sm mb-3 ${isDark ? "text-orange-300" : "text-orange-700"}`}>Core Principles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { icon: Eye, title: "Privacy First", desc: "Raw biometric data never leaves the edge node. Only opaque 32-byte proofs go on-chain.", color: "emerald" },
                    { icon: Shield, title: "Quantum Resistant", desc: "AGT tensor sequences encoded as polynomial knot invariants — resistant to quantum attacks.", color: "blue" },
                    { icon: Zap, title: "x402 Native", desc: "Micropayment attestation built-in. Pay-per-action with $OPTX staking tiers.", color: "yellow" },
                  ].map((card) => {
                    const Icon = card.icon
                    return (
                      <div key={card.title} className={`p-4 rounded-lg border transition-colors ${
                        isDark ? "border-orange-500/15 bg-black/20 hover:border-orange-500/30" : "border-orange-200/30 bg-white/50 hover:border-orange-300/60"
                      }`}>
                        <Icon className={`w-5 h-5 text-${card.color}-400 mb-2`} />
                        <h4 className={`font-mono text-xs font-bold mb-1 ${isDark ? "text-white" : "text-zinc-800"}`}>{card.title}</h4>
                        <p className={`font-mono text-[10px] leading-relaxed ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{card.desc}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═══ HOW IT WORKS ═══ */}
          {activeSection === "how-it-works" && (
            <div className="space-y-6">
              <div data-section="Private Gaze Audit">
                <h2 className={`font-mono text-lg mb-2 ${isDark ? "text-orange-400" : "text-orange-700"}`}>How It Works</h2>
                <p className={`font-mono text-xs leading-relaxed max-w-2xl mb-6 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                  AARON splits biometric authentication into four phases — capture, proof, payment, and access.
                </p>
              </div>

              {[
                {
                  key: "Private Gaze Audit",
                  icon: Eye,
                  title: "1. Private Gaze Audit",
                  desc: "AARON captures biometric tensors on-device using MediaPipe face landmarks. Raw iris data never leaves the edge node. The Adaptive Gaze Tensor (AGT) system classifies eye movement into three tensors: Cognitive (COG), Emotional (EMO), and Environmental (ENV).",
                  color: "emerald",
                },
                {
                  key: "Opaque Proof",
                  icon: Shield,
                  title: "2. Opaque Proof to Solana",
                  desc: "A 32-byte verification hash is computed from the gaze sequence, hold durations, and session nonce. This hash is submitted on-chain via the CSTB DePIN program. Validators confirm the proof without ever seeing raw biometric data.",
                  color: "blue",
                },
                {
                  key: "x402 Payments",
                  icon: Zap,
                  title: "3. x402 Unlocks Action",
                  desc: "Payment attestation triggers domain registration, NFT mint, or agent delegation via micropayment. The x402 protocol settles OPTX payments atomically alongside the biometric proof.",
                  color: "yellow",
                },
                {
                  key: "Staked Tiers",
                  icon: Layers,
                  title: "4. Staked Tiers via Layer 3",
                  desc: "$OPTX staking determines access tiers. Higher stake = lower x402 fees + priority compute. Tiers: Explorer (0 OPTX), Pioneer (100 OPTX), Architect (1000 OPTX), Founder (10000 OPTX).",
                  color: "purple",
                },
              ].map((step) => {
                const Icon = step.icon
                return (
                  <div key={step.key} data-section={step.key} className={`p-5 rounded-lg border transition-colors scroll-mt-4 ${
                    isDark ? "border-orange-500/15 bg-black/20" : "border-orange-200/30 bg-white/50"
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className={`w-5 h-5 text-${step.color}-400`} />
                      <h3 className={`font-mono text-sm font-bold ${isDark ? "text-orange-300" : "text-orange-700"}`}>{step.title}</h3>
                    </div>
                    <p className={`font-mono text-[11px] leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{step.desc}</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* ═══ QUICK START ═══ */}
          {activeSection === "quick-start" && (
            <div className="space-y-6">
              <div data-section="TypeScript SDK">
                <h2 className={`font-mono text-lg mb-2 ${isDark ? "text-orange-400" : "text-orange-700"}`}>Quick Start</h2>
                <p className={`font-mono text-xs leading-relaxed max-w-2xl mb-6 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                  Integrate AARON attestation into your app in three lines.
                </p>
              </div>

              <div data-section="TypeScript SDK" className="scroll-mt-4">
                <h3 className={`font-mono text-sm mb-3 ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                  <Code2 className="w-4 h-4 inline mr-2" />TypeScript SDK
                </h3>
                <CodeBlock
                  theme={theme}
                  language="typescript"
                  code={`import { Aaron } from "@astroknots/sdk";

const aaron = new Aaron({ endpoint: "https://api.astroknots.space" });
const proof = await aaron.attest({ gaze: "MEDIUM", x402: "0.05 OPTX" });
console.log(proof.txSignature); // Solana transaction hash`}
                />
              </div>

              <div data-section="Python SDK" className="scroll-mt-4">
                <h3 className={`font-mono text-sm mb-3 ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                  <Terminal className="w-4 h-4 inline mr-2" />Python SDK
                </h3>
                <CodeBlock
                  theme={theme}
                  language="python"
                  code={`from astroknots import Aaron

aaron = Aaron(endpoint="https://api.astroknots.space")
proof = aaron.attest(gaze="MEDIUM", x402="0.05 OPTX")
print(proof.tx_signature)  # Solana transaction hash`}
                />
              </div>

              <div data-section="Response Shape" className="scroll-mt-4">
                <h3 className={`font-mono text-sm mb-3 ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                  <ArrowRight className="w-4 h-4 inline mr-2" />Response Shape
                </h3>
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

              <div className={`p-3 rounded-lg border ${isDark ? "bg-orange-500/5 border-orange-500/15" : "bg-orange-50 border-orange-200/40"}`}>
                <p className={`font-mono text-[10px] flex items-center gap-2 ${isDark ? "text-orange-400" : "text-orange-700"}`}>
                  <Shield className="w-3 h-3" /> SDKs are in early alpha. Use the curl/REST API for production integrations.
                </p>
              </div>
            </div>
          )}

          {/* ═══ ON-CHAIN ═══ */}
          {activeSection === "on-chain" && (
            <div className="space-y-6">
              <div data-section="Token Addresses">
                <h2 className={`font-mono text-lg mb-2 ${isDark ? "text-orange-400" : "text-orange-700"}`}>On-Chain Addresses</h2>
                <p className={`font-mono text-xs leading-relaxed max-w-2xl mb-6 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                  Solana program and token addresses for the OPTX ecosystem.
                </p>
              </div>

              <div data-section="Token Addresses" className="space-y-2 scroll-mt-4">
                <AddressBadge theme={theme} label="DePIN Program" addr={ON_CHAIN.DEPIN_PROGRAM} net="devnet" />
                <AddressBadge theme={theme} label="$OPTX Mint" addr={ON_CHAIN.OPTX_MINT} net="devnet" />
                <AddressBadge theme={theme} label="$JTX Mint" addr={ON_CHAIN.JTX_MINT} net="mainnet" />
                <AddressBadge theme={theme} label="$CSTB Mint" addr={ON_CHAIN.CSTB_MINT} net="devnet" />
              </div>

              <div data-section="Explorer Links" className="scroll-mt-4">
                <h3 className={`font-mono text-sm mb-3 ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                  <ExternalLink className="w-4 h-4 inline mr-2" />Explorer Links
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { label: "DePIN Program", addr: ON_CHAIN.DEPIN_PROGRAM, cluster: "devnet" },
                    { label: "$OPTX Token", addr: ON_CHAIN.OPTX_MINT, cluster: "devnet" },
                    { label: "$JTX Token", addr: ON_CHAIN.JTX_MINT, cluster: "mainnet-beta" },
                    { label: "$CSTB Token", addr: ON_CHAIN.CSTB_MINT, cluster: "devnet" },
                  ].map((item) => (
                    <a
                      key={item.label}
                      href={`https://explorer.solana.com/address/${item.addr}?cluster=${item.cluster}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${isDark ? "border-orange-500/10 bg-black/20 hover:border-orange-500/25 text-orange-300" : "border-orange-200/30 bg-white/50 hover:border-orange-300/60 text-orange-700"}`}
                    >
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-mono text-[10px]">{item.label}</span>
                      <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                    </a>
                  ))}
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${isDark ? "bg-yellow-500/5 border-yellow-500/15" : "bg-yellow-50 border-yellow-200/40"}`}>
                <p className={`font-mono text-[10px] flex items-center gap-2 ${isDark ? "text-yellow-400" : "text-yellow-700"}`}>
                  <Zap className="w-3 h-3" /> $OPTX, $CSTB, and the DePIN Program are currently on <strong>Solana devnet</strong>. $JTX is on mainnet.
                </p>
              </div>
            </div>
          )}

          {/* ═══ ARCHITECTURE ═══ */}
          {activeSection === "architecture" && (
            <div className="space-y-6">
              <div data-section="System Diagram">
                <h2 className={`font-mono text-lg mb-2 ${isDark ? "text-orange-400" : "text-orange-700"}`}>Architecture</h2>
                <p className={`font-mono text-xs leading-relaxed max-w-2xl mb-6 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                  High-level system diagram of the AARON protocol stack.
                </p>
              </div>

              <div data-section="System Diagram" className="scroll-mt-4">
                <CodeBlock theme={theme} language="text" code={`┌─────────────────────────────────────────────────────────┐
│  CLIENT (Browser / iOS / Agent)                         │
│  ├── Camera Feed → MediaPipe → AGT Classification       │
│  ├── Wallet Connection (Phantom / OKX)                  │
│  └── x402 Payment Attestation                           │
├─────────────────────────────────────────────────────────┤
│  AARON EDGE ROUTER                                      │
│  ├── Biometric capture + gaze tensor classification     │
│  ├── JOULE template generation (polynomial encoding)    │
│  ├── Verification hash computation (SHA-256)            │
│  └── x402 micropayment settlement                       │
├─────────────────────────────────────────────────────────┤
│  EDGE COMPUTE (Private)                                 │
│  ├── Real-time tensor storage                           │
│  ├── JOE Agent (AI orchestration)                       │
│  └── Encrypted mesh networking                          │
├─────────────────────────────────────────────────────────┤
│  ON-CHAIN (Solana — Public)                             │
│  ├── CSTB Trust DePIN Program (Anchor)                  │
│  ├── $OPTX Token (Token-2022 SPL)                       │
│  ├── $JTX Governance Token                              │
│  └── 32-byte attestation proof (opaque)                 │
└─────────────────────────────────────────────────────────┘`} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { label: "Edge Layer", desc: "Biometric data stays private. Only hashes leave the device.", icon: Cpu, color: "emerald" },
                  { label: "Protocol Layer", desc: "AARON validates proofs and routes x402 payments.", icon: Fingerprint, color: "orange" },
                  { label: "Chain Layer", desc: "Solana stores attestation PDAs. Public verification.", icon: Layers, color: "blue" },
                ].map((layer) => {
                  const Icon = layer.icon
                  return (
                    <div key={layer.label} className={`p-4 rounded-lg border ${isDark ? "border-orange-500/15 bg-black/20" : "border-orange-200/30 bg-white/50"}`}>
                      <Icon className={`w-5 h-5 text-${layer.color}-400 mb-2`} />
                      <h4 className={`font-mono text-xs font-bold mb-1 ${isDark ? "text-orange-300" : "text-orange-700"}`}>{layer.label}</h4>
                      <p className={`font-mono text-[10px] leading-relaxed ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{layer.desc}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ═══ Right TOC sidebar (desktop only) ═══ */}
        <div className="hidden xl:block w-48 shrink-0 p-4 relative z-10">
          <div className="sticky top-[69px]">
            <p className={`text-[9px] font-mono uppercase tracking-widest mb-3 flex items-center gap-1 ${isDark ? "text-orange-400/40" : "text-orange-700/60"}`}>
              <ChevronRight className="w-3 h-3" />
              On this page
            </p>
            <div className={`space-y-0.5 border-l ${isDark ? "border-orange-500/10" : "border-orange-300/20"}`}>
              {activeSectionConfig.tocItems.map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className={`block w-full text-left pl-3 py-1 text-[11px] font-mono transition-all duration-200 border-l-2 -ml-px ${
                    activeTocItem === item
                      ? isDark
                        ? "border-orange-500 text-orange-400"
                        : "border-orange-500 text-orange-700"
                      : isDark
                        ? "border-transparent text-orange-400/40 hover:text-orange-400/70 hover:border-orange-500/30"
                        : "border-transparent text-orange-700/60 hover:text-orange-700/80 hover:border-orange-400/40"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Footer ═══ */}
      <div className={`relative z-10 border-t ${isDark ? "border-orange-500/15" : "border-orange-200/30"}`}>
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className={`font-mono text-[10px] ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
            Built by <a href="https://jettoptics.ai" className={`${isDark ? "text-orange-400" : "text-orange-600"} hover:underline`}>Jett Optics.ai</a>. 100% in-house. No external frameworks.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://jettoptics.ai" className={`font-mono text-[10px] transition-colors ${isDark ? "text-zinc-500 hover:text-orange-400" : "text-zinc-400 hover:text-orange-600"}`}>
              <Globe className="w-3.5 h-3.5 inline mr-1" />jettoptics.ai
            </a>
            <a href="https://x.com/jettoptx" target="_blank" rel="noopener noreferrer" className={`font-mono text-[10px] transition-colors ${isDark ? "text-zinc-500 hover:text-orange-400" : "text-zinc-400 hover:text-orange-600"}`}>
              @jettoptx
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
