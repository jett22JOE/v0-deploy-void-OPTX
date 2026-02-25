"use client"

import { useState, useEffect, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft, BookOpen, Code2, Wallet, Eye, Shield, Zap, Network,
  ExternalLink, Copy, Check, Terminal, Layers, Globe, ChevronRight,
  Cpu, Lock, Fingerprint, BrainCircuit, Sun, Moon, PanelLeftClose, PanelLeft
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background"

type DocTab = "overview" | "api" | "wallet" | "gaze" | "bridge" | "cstb" | "hedgehog" | "aaron"

const TABS: { key: DocTab; label: string; icon: typeof Code2; color: string; sections: string[] }[] = [
  { key: "overview", label: "Overview", icon: BookOpen, color: "orange", sections: ["Welcome to the OPTX Developer Suite", "Quick Start", "System Architecture", "On-Chain Addresses"] },
  { key: "api", label: "API Reference", icon: Code2, color: "yellow", sections: ["API Reference", "WebSocket RPC", "Platform Capabilities", "REST Endpoints"] },
  { key: "gaze", label: "Gaze Verification", icon: Eye, color: "green", sections: ["Gaze Verification Guide", "AGT Tensors", "Integration Example", "JETT Protocol"] },
  { key: "wallet", label: "ERC-8004 Wallet", icon: Wallet, color: "blue", sections: ["ERC-8004 Agent Wallet", "Wallet Integration", "Agent Metadata"] },
  { key: "bridge", label: "LayerZero Bridge", icon: Network, color: "purple", sections: ["LayerZero Bridge", "Bridge Architecture", "Bridge Example"] },
  { key: "cstb", label: "CSTB / DePIN", icon: Shield, color: "red", sections: ["CSTB Trust DePIN Protocol", "Reward Distribution", "Attestation Flow", "Anchor Program"] },
  { key: "hedgehog", label: "Edge MCP", icon: BrainCircuit, color: "cyan", sections: ["Edge MCP Overview", "MCP Tools", "Gateway Pattern", "Usage Examples"] },
  { key: "aaron", label: "AARON Protocol", icon: Fingerprint, color: "emerald", sections: ["AARON Protocol Overview", "Biometric Proof Registry", "Rust Reducers", "Client Integration"] },
]

const ON_CHAIN = {
  DEPIN_PROGRAM: "91SqqYLMi5zNsfMab6rnvipwJhDpN4FEMSLgu8F3bbGq",
  OPTX_MINT: "4r9WoPsRjJzrYEuj6VdwowVrFZaXpu16Qt6xogcmdUXC",
  JTX_MINT: "9XpJiKEYzq5yDo5pJzRfjSRMPL2yPfDQXgiN7uYtBhUj",
  CSTB_MINT: "4waAAfTjqf5LNpj2TC5zoeiAgegVwKWoy4WiJgjdBkVL",
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
        <Badge className={`text-[8px] h-4 ${net === "mainnet" ? "bg-green-500/15 text-green-400 border-green-500/25" : "bg-yellow-500/15 text-yellow-400 border-yellow-500/25"}`}>
          {net}
        </Badge>
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

function CodeBlock({ code, language = "typescript", theme }: { code: string; language?: string; theme: string }) {
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

function DocsContent() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState<DocTab>("overview")
  const [activeSection, setActiveSection] = useState("")
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [collapsed, setCollapsed] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // Load sidebar + theme state from localStorage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem("docs-sidebar-collapsed")
    if (savedCollapsed === "true") setCollapsed(true)
    const saved = localStorage.getItem("dojo-theme") as "dark" | "light" | null
    if (saved) setTheme(saved)

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as "dark" | "light"
      setTheme(detail)
    }
    window.addEventListener("dojo-theme-change", handler)
    return () => window.removeEventListener("dojo-theme-change", handler)
  }, [])

  useEffect(() => {
    localStorage.setItem("docs-sidebar-collapsed", String(collapsed))
  }, [collapsed])

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    localStorage.setItem("dojo-theme", next)
    window.dispatchEvent(new CustomEvent("dojo-theme-change", { detail: next }))
  }

  const activeTabConfig = TABS.find((t) => t.key === activeTab)!

  // Track active section on scroll
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
      setActiveSection(current)
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [activeTab])

  // Reset active section on tab change
  useEffect(() => {
    setActiveSection("")
  }, [activeTab])

  const scrollToSection = (section: string) => {
    const container = contentRef.current
    if (!container) return
    const el = container.querySelector(`[data-section="${section}"]`)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const isDark = theme === "dark"

  return (
    <div className={`min-h-screen relative ${isDark ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black" : "bg-gradient-to-br from-orange-50/50 via-white to-zinc-50"}`}>
      {/* Dotted glow background */}
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

      {/* Header */}
      <div className={`border-b backdrop-blur sticky top-0 z-20 ${isDark ? "border-orange-500/20 bg-black/60" : "border-orange-200/40 bg-white/80"}`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className={`transition-colors ${isDark ? "text-orange-400 hover:text-orange-300" : "text-orange-600 hover:text-orange-500"}`}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? "bg-orange-500/20" : "bg-orange-100"}`}>
              <Code2 className={`w-4 h-4 ${isDark ? "text-orange-400" : "text-orange-600"}`} />
            </div>
            <div>
              <h1 className={`font-mono text-sm tracking-widest ${isDark ? "text-orange-400" : "text-orange-700"}`}>OPTX DEVELOPER SUITE</h1>
              <p className={`font-mono text-[9px] ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>Documentation &amp; Tools for $OPTX Integration</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
            <Badge className={`text-[9px] ${isDark ? "bg-orange-500/20 text-orange-400 border-orange-500/30" : "bg-orange-100 text-orange-700 border-orange-200"}`}>v0.1.0</Badge>
            <Link href="/dojo">
              <Button size="sm" className={`h-7 text-[10px] px-3 font-mono ${isDark ? "bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30" : "bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200"}`}>
                Open DOJO <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex gap-0 relative z-10">
        {/* Collapsible Sidebar */}
        <div className={`${collapsed ? "w-[72px]" : "w-56"} shrink-0 border-r min-h-[calc(100vh-53px)] flex flex-col sticky top-[53px] self-start transition-all duration-300 ease-in-out ${isDark ? "border-orange-500/15 bg-black/20 backdrop-blur-sm" : "border-orange-200/30 bg-white/40 backdrop-blur-sm"}`}>
          {/* Logo + collapse toggle */}
          <div className={`${collapsed ? "px-3 py-3" : "p-3"} border-b flex ${collapsed ? "flex-col items-center gap-2" : "items-center justify-between"} ${isDark ? "border-orange-500/15" : "border-orange-200/30"}`}>
            <Link href="/dojo" className="flex items-center gap-2 group">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isDark ? "bg-orange-500/15 group-hover:bg-orange-500/25" : "bg-orange-100 group-hover:bg-orange-200"}`}>
                <Image
                  src="/images/astroknots-logo.png"
                  alt="OPTX"
                  width={20}
                  height={20}
                  className="rounded-full object-contain"
                />
              </div>
              {!collapsed && (
                <div className="flex flex-col">
                  <span className={`text-sm font-bold font-mono tracking-wider ${isDark ? "text-orange-400" : "text-orange-700"}`}>DOCS</span>
                  <span className={`text-[9px] font-mono ${isDark ? "text-orange-500/50" : "text-orange-500/60"}`}>OPTX Suite</span>
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
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  title={collapsed ? tab.label : undefined}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition-all duration-200 text-left ${
                    collapsed ? "justify-center" : ""
                  } ${
                    isActive
                      ? isDark
                        ? "bg-orange-500/15 text-orange-400 border-l-2 border-orange-500 shadow-[inset_0_0_12px_rgba(181,82,0,0.08)]"
                        : "bg-orange-100/80 text-orange-700 border-l-2 border-orange-500"
                      : isDark
                        ? "text-orange-400/50 hover:text-orange-400 hover:bg-orange-500/8"
                        : "text-orange-700/60 hover:text-orange-700 hover:bg-orange-100/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? (isDark ? "text-orange-400" : "text-orange-700") : (isDark ? "text-orange-400/50" : "text-orange-700/60")}`} />
                  {!collapsed && <span>{tab.label}</span>}
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
              title={collapsed ? "GitHub Repo" : undefined}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition-colors ${collapsed ? "justify-center" : ""} ${isDark ? "text-orange-400/50 hover:text-orange-400 hover:bg-orange-500/8" : "text-orange-700/60 hover:text-orange-700 hover:bg-orange-100/50"}`}>
              <Globe className="w-4 h-4 shrink-0" />
              {!collapsed && <><span>GitHub</span><ExternalLink className="w-3 h-3 ml-auto" /></>}
            </a>
            <a href="https://explorer.solana.com/address/91SqqYLMi5zNsfMab6rnvipwJhDpN4FEMSLgu8F3bbGq?cluster=devnet" target="_blank" rel="noopener noreferrer"
              title={collapsed ? "Solana Explorer" : undefined}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition-colors ${collapsed ? "justify-center" : ""} ${isDark ? "text-orange-400/50 hover:text-orange-400 hover:bg-orange-500/8" : "text-orange-700/60 hover:text-orange-700 hover:bg-orange-100/50"}`}>
              <Layers className="w-4 h-4 shrink-0" />
              {!collapsed && <><span>Explorer</span><ExternalLink className="w-3 h-3 ml-auto" /></>}
            </a>
          </div>
        </div>

        {/* Content */}
        <div ref={contentRef} className="flex-1 p-6 space-y-6 min-w-0 overflow-auto max-h-[calc(100vh-53px)]">

          {/* ===================== OVERVIEW ===================== */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div data-section="Welcome to the OPTX Developer Suite">
                <h2 className={`font-mono text-lg mb-2 scroll-mt-4 ${isDark ? "text-orange-400" : "text-orange-700"}`}>Welcome to the OPTX Developer Suite</h2>
                <p className={`font-mono text-xs leading-relaxed max-w-2xl ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                  Build applications with gaze-authenticated biometric verification, on-chain attestation via the CSTB Trust DePIN protocol,
                  and cross-chain token bridging. The $OPTX token powers the incentive layer for neuromorphic authentication.
                </p>
              </div>

              {/* Quick Start Cards */}
              <div data-section="Quick Start" className="scroll-mt-4">
                <h3 className={`font-mono text-sm mb-3 ${isDark ? "text-orange-300" : "text-orange-600"}`}>Quick Start</h3>
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
                            <h3 className={`font-mono text-sm mb-1 ${isDark ? "text-white" : "text-zinc-800"}`}>{card.title}</h3>
                            <p className={`font-mono text-[10px] leading-relaxed ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{card.desc}</p>
                          </CardContent>
                        </Card>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Architecture */}
              <Card className={`${isDark ? "border-orange-500/20 bg-black/30" : "border-orange-200/30 bg-white/50"}`}>
                <CardHeader className={`p-4 border-b ${isDark ? "border-orange-500/15" : "border-orange-200/20"}`}>
                  <CardTitle data-section="System Architecture" className={`text-sm flex items-center gap-2 scroll-mt-4 ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                    <Cpu className="w-4 h-4" /> System Architecture
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <CodeBlock theme={theme} language="text" code={`┌─────────────────────────────────────────────────────────┐
│  CLIENT (Next.js / React Native)                        │
│  ├── Gaze Camera Feed → MediaPipe → AGT Classification  │
│  ├── Account Auth + Gaze Biometric (identity)           │
│  └── Phantom / OKX Wallet Connection                    │
├─────────────────────────────────────────────────────────┤
│  EDGE COMPUTE                                           │
│  ├── JOE Agent (AI-powered assistant)                   │
│  ├── Real-time state engine (subscriptions)             │
│  └── Encrypted mesh networking                          │
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
              <Card className={`${isDark ? "border-orange-500/20 bg-black/30" : "border-orange-200/30 bg-white/50"}`}>
                <CardHeader className={`p-4 border-b ${isDark ? "border-orange-500/15" : "border-orange-200/20"}`}>
                  <CardTitle data-section="On-Chain Addresses" className={`text-sm flex items-center gap-2 scroll-mt-4 ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                    <Layers className="w-4 h-4" /> On-Chain Addresses
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <AddressBadge theme={theme} label="DePIN Program" addr={ON_CHAIN.DEPIN_PROGRAM} net="devnet" />
                  <AddressBadge theme={theme} label="$OPTX Mint" addr={ON_CHAIN.OPTX_MINT} net="devnet" />
                  <AddressBadge theme={theme} label="$JTX Mint" addr={ON_CHAIN.JTX_MINT} net="mainnet" />
                  <AddressBadge theme={theme} label="$CSTB Mint" addr={ON_CHAIN.CSTB_MINT} net="devnet" />
                </CardContent>
              </Card>
            </div>
          )}

          {/* ===================== API REFERENCE ===================== */}
          {activeTab === "api" && (
            <div className="space-y-6">
              <div data-section="API Reference" className="scroll-mt-4">
                <h2 className={`font-mono text-lg ${isDark ? "text-orange-400" : "text-orange-700"}`}>API Reference</h2>
                <p className={`font-mono text-xs leading-relaxed mt-2 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                  The OPTX platform exposes a WebSocket API for real-time agent communication and REST endpoints for frontend integration.
                </p>
              </div>

              <Card className={`${isDark ? "border-orange-500/20 bg-black/30" : "border-orange-200/30 bg-white/50"}`}>
                <CardHeader className={`p-4 border-b ${isDark ? "border-orange-500/15" : "border-orange-200/20"}`}>
                  <CardTitle data-section="WebSocket RPC" className={`text-sm flex items-center gap-2 scroll-mt-4 ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                    <Terminal className="w-4 h-4" /> WebSocket RPC (JOE Agent)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <p className={`font-mono text-[10px] ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>Connect to the JOE agent via the DOJO Connections tab. Authentication required.</p>
                  <CodeBlock theme={theme} code={`// JOE Agent WebSocket message types
// Connection is managed by the DOJO — no direct endpoint access

// Chat message
{ type: "chat", user: "your-username", content: "Hello JOE" }

// Response format
{
  content: "JOE's response text",
  tensor: "COG/EMO/ENV classification",
  cstb_score: 0.85,  // CSTB attestation score
}

// Wallet queries (admin only)
{ type: "wallet_status" }   // → balances + attestation
{ type: "wallet_metadata" } // → ERC-8004 agent identity
{ type: "x402_policy" }     // → payment policy
{ type: "bridge_status" }   // → LayerZero bridge info`} />
                </CardContent>
              </Card>

              <Card className={`${isDark ? "border-orange-500/20 bg-black/30" : "border-orange-200/30 bg-white/50"}`}>
                <CardHeader className={`p-4 border-b ${isDark ? "border-orange-500/15" : "border-orange-200/20"}`}>
                  <CardTitle data-section="Platform Capabilities" className={`text-sm flex items-center gap-2 scroll-mt-4 ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                    <Code2 className="w-4 h-4" /> Platform Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <p className={`font-mono text-[10px] ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>Core platform capabilities available to integrated applications.</p>
                  <CodeBlock theme={theme} language="json" code={`{
  "capabilities": [
    "gaze_data_storage",        // Store COG/ENV/EMO gaze tensors
    "gaze_data_retrieval",      // Retrieve gaze tracking history
    "gaze_pattern_analysis",    // AI-powered gaze pattern insights
    "context_awareness",        // Spatial workspace state management
    "ai_chat",                  // Multi-model AI assistant
    "usage_analytics"           // API usage and audit trail
  ]
}`} />
                </CardContent>
              </Card>

              <Card className={`${isDark ? "border-orange-500/20 bg-black/30" : "border-orange-200/30 bg-white/50"}`}>
                <CardHeader className={`p-4 border-b ${isDark ? "border-orange-500/15" : "border-orange-200/20"}`}>
                  <CardTitle data-section="REST Endpoints" className={`text-sm flex items-center gap-2 scroll-mt-4 ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                    <Zap className="w-4 h-4" /> REST Endpoints
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {[
                    { method: "POST", path: "/api/gaze/store", desc: "Submit gaze tensor data for attestation" },
                    { method: "GET", path: "/api/gaze/history", desc: "Retrieve gaze session history" },
                    { method: "POST", path: "/api/verify-session", desc: "Verify subscription and access tier" },
                    { method: "GET", path: "/api/attestation/status", desc: "Check CSTB attestation progress" },
                  ].map((ep) => (
                    <div key={ep.path} className={`flex items-center gap-3 p-2 rounded border ${isDark ? "bg-black/20 border-orange-500/10" : "bg-white/60 border-orange-200/20"}`}>
                      <Badge className={`text-[8px] h-4 font-mono ${ep.method === "GET" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"}`}>
                        {ep.method}
                      </Badge>
                      <code className={`font-mono text-[10px] ${isDark ? "text-orange-300" : "text-orange-600"}`}>{ep.path}</code>
                      <span className={`font-mono text-[9px] ml-auto ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{ep.desc}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ===================== GAZE VERIFICATION ===================== */}
          {activeTab === "gaze" && (
            <div className="space-y-6">
              <div data-section="Gaze Verification Guide" className="scroll-mt-4">
                <h2 className={`font-mono text-lg flex items-center gap-2 ${isDark ? "text-orange-400" : "text-orange-700"}`}>
                  <Eye className="w-5 h-5" /> Gaze Verification Guide
                </h2>
                <p className={`font-mono text-xs leading-relaxed max-w-2xl mt-2 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                  The Agentive Gaze Tensor (AGT) system classifies eye movement into three biometric tensors:
                  Cognitive (COG), Emotional (EMO), and Environmental (ENV). These form a unique gaze signature for authentication.
                </p>
              </div>

              {/* AGT Tensors */}
              <div data-section="AGT Tensors" className="grid grid-cols-1 md:grid-cols-3 gap-3 scroll-mt-4">
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
                      <p className={`font-mono text-[10px] leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className={`${isDark ? "border-orange-500/20 bg-black/30" : "border-orange-200/30 bg-white/50"}`}>
                <CardHeader className={`p-4 border-b ${isDark ? "border-orange-500/15" : "border-orange-200/20"}`}>
                  <CardTitle data-section="Integration Example" className={`text-sm flex items-center gap-2 scroll-mt-4 ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                    <Fingerprint className="w-4 h-4" /> Integration Example
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <CodeBlock theme={theme} code={`import { useGazeClassifier } from "@jettoptics/gaze-sdk"

function GazeAuth() {
  const { tensor, confidence, weights } = useGazeClassifier({
    camera: true,      // Enable webcam capture
    fps: 60,           // Classification frequency
    minConfidence: 0.7 // Minimum confidence threshold
  })

  // tensor: "COG" | "EMO" | "ENV"
  // confidence: 0.0 - 1.0
  // weights: { COG: number, EMO: number, ENV: number }

  // Store gaze data for attestation
  const attestGaze = async () => {
    await fetch("/api/gaze/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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

              <Card className={`${isDark ? "border-orange-500/20 bg-black/30" : "border-orange-200/30 bg-white/50"}`}>
                <CardHeader className={`p-4 border-b ${isDark ? "border-orange-500/15" : "border-orange-200/20"}`}>
                  <CardTitle data-section="JETT Protocol" className={`text-sm flex items-center gap-2 scroll-mt-4 ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                    <BrainCircuit className="w-4 h-4" /> JETT Protocol
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <p className={`font-mono text-[10px] leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                    <strong className={isDark ? "text-orange-300" : "text-orange-600"}>Joule Encryption Temporal Template (JETT)</strong> derives quantum-resistant encryption keys from gaze biometrics.
                    Your unique gaze pattern generates a deterministic seed that serves as a wallet signature vault.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Training Sessions", desc: "Build AGT baseline via /dojo/training" },
                      { label: "Stability Score", desc: "Analytics tracks tensor consistency" },
                      { label: "Gaze Seed", desc: "Deterministic key from weighted AGT" },
                      { label: "Vault Signing", desc: "Web3 wallet signs with gaze-derived key" },
                    ].map((item) => (
                      <div key={item.label} className={`p-2 rounded border ${isDark ? "bg-black/20 border-orange-500/10" : "bg-white/60 border-orange-200/20"}`}>
                        <p className={`font-mono text-[10px] font-semibold ${isDark ? "text-orange-300" : "text-orange-600"}`}>{item.label}</p>
                        <p className={`font-mono text-[9px] ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{item.desc}</p>
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
              <div data-section="ERC-8004 Agent Wallet" className="scroll-mt-4">
                <h2 className={`font-mono text-lg flex items-center gap-2 ${isDark ? "text-orange-400" : "text-orange-700"}`}>
                  <Wallet className="w-5 h-5" /> ERC-8004 Agent Wallet
                </h2>
                <p className={`font-mono text-xs leading-relaxed max-w-2xl mt-2 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                  The OPTX Agent Wallet implements a non-transferable, soulbound identity bound to gaze biometrics.
                  Unlike standard wallets, the ERC-8004 interface links computational proof to the holder&apos;s identity.
                </p>
              </div>

              <Card className={`${isDark ? "border-blue-500/20 bg-black/30" : "border-blue-200/30 bg-white/50"}`}>
                <CardHeader className={`p-4 border-b ${isDark ? "border-blue-500/15" : "border-blue-200/20"}`}>
                  <CardTitle data-section="Wallet Integration" className={`text-sm flex items-center gap-2 scroll-mt-4 ${isDark ? "text-blue-300" : "text-blue-700"}`}>
                    <Lock className="w-4 h-4" /> Wallet Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <CodeBlock theme={theme} code={`// Connect Phantom or OKX wallet
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

              <Card className={`${isDark ? "border-blue-500/20 bg-black/30" : "border-blue-200/30 bg-white/50"}`}>
                <CardHeader className={`p-4 border-b ${isDark ? "border-blue-500/15" : "border-blue-200/20"}`}>
                  <CardTitle data-section="Agent Metadata" className={`text-sm flex items-center gap-2 scroll-mt-4 ${isDark ? "text-blue-300" : "text-blue-700"}`}>
                    <Shield className="w-4 h-4" /> Agent Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <p className={`font-mono text-[10px] leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                    Each OPTX Agent Wallet carries metadata that includes CSTB profile URI, gaze attestation hash, and AGT baseline weights.
                  </p>
                  <CodeBlock theme={theme} language="json" code={`{
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
              <div data-section="LayerZero Bridge" className="scroll-mt-4">
                <h2 className={`font-mono text-lg flex items-center gap-2 ${isDark ? "text-orange-400" : "text-orange-700"}`}>
                  <Network className="w-5 h-5" /> LayerZero Bridge
                </h2>
                <p className={`font-mono text-xs leading-relaxed max-w-2xl mt-2 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                  Bridge $OPTX between Solana and EVM chains using the LayerZero Omnichain Fungible Token (OFT) standard.
                  This enables cross-chain DePIN reward distribution and multi-chain wallet verification.
                </p>
              </div>

              <Card className={`${isDark ? "border-purple-500/20 bg-black/30" : "border-purple-200/30 bg-white/50"}`}>
                <CardHeader className={`p-4 border-b ${isDark ? "border-purple-500/15" : "border-purple-200/20"}`}>
                  <CardTitle data-section="Bridge Architecture" className={`text-sm flex items-center gap-2 scroll-mt-4 ${isDark ? "text-purple-300" : "text-purple-700"}`}>
                    <Layers className="w-4 h-4" /> Bridge Architecture
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <CodeBlock theme={theme} language="text" code={`Solana ($OPTX SPL Token-2022)
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

              <Card className={`${isDark ? "border-purple-500/20 bg-black/30" : "border-purple-200/30 bg-white/50"}`}>
                <CardHeader className={`p-4 border-b ${isDark ? "border-purple-500/15" : "border-purple-200/20"}`}>
                  <CardTitle data-section="Bridge Example" className={`text-sm flex items-center gap-2 scroll-mt-4 ${isDark ? "text-purple-300" : "text-purple-700"}`}>
                    <Code2 className="w-4 h-4" /> Bridge Example
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <CodeBlock theme={theme} code={`// Bridge $OPTX from Solana to Base
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
              <div data-section="CSTB Trust DePIN Protocol" className="scroll-mt-4">
                <h2 className={`font-mono text-lg flex items-center gap-2 ${isDark ? "text-orange-400" : "text-orange-700"}`}>
                  <Shield className="w-5 h-5" /> CSTB Trust DePIN Protocol
                </h2>
                <p className={`font-mono text-xs leading-relaxed max-w-2xl mt-2 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                  CompuStable (CSTB) is the on-chain attestation layer that verifies gaze biometric proofs.
                  The DePIN (Decentralized Physical Infrastructure Network) distributes $OPTX rewards to validated gaze sessions.
                </p>
              </div>

              <Card className={`${isDark ? "border-red-500/20 bg-black/30" : "border-red-200/30 bg-white/50"}`}>
                <CardHeader className={`p-4 border-b ${isDark ? "border-red-500/15" : "border-red-200/20"}`}>
                  <CardTitle data-section="Reward Distribution" className={`text-sm flex items-center gap-2 scroll-mt-4 ${isDark ? "text-red-300" : "text-red-700"}`}>
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
                        <p className={`font-mono text-xs mt-1 ${isDark ? "text-white" : "text-zinc-800"}`}>{r.label}</p>
                        <p className={`font-mono text-[9px] mt-0.5 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{r.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className={`${isDark ? "border-red-500/20 bg-black/30" : "border-red-200/30 bg-white/50"}`}>
                <CardHeader className={`p-4 border-b ${isDark ? "border-red-500/15" : "border-red-200/20"}`}>
                  <CardTitle data-section="Attestation Flow" className={`text-sm flex items-center gap-2 scroll-mt-4 ${isDark ? "text-red-300" : "text-red-700"}`}>
                    <Terminal className="w-4 h-4" /> Attestation Flow
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <CodeBlock theme={theme} language="text" code={`1. User starts gaze training session in DOJO
2. Camera captures eye movement at 60fps
3. MediaPipe classifies gaze → AGT tensors (COG/EMO/ENV)
4. Minimum 222cs of data collected (quality threshold)
5. Edge compute stores tensors in real-time database
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

              <Card className={`${isDark ? "border-red-500/20 bg-black/30" : "border-red-200/30 bg-white/50"}`}>
                <CardHeader className={`p-4 border-b ${isDark ? "border-red-500/15" : "border-red-200/20"}`}>
                  <CardTitle data-section="Anchor Program" className={`text-sm flex items-center gap-2 scroll-mt-4 ${isDark ? "text-red-300" : "text-red-700"}`}>
                    <Code2 className="w-4 h-4" /> Anchor Program
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <CodeBlock theme={theme} language="rust" code={`use anchor_lang::prelude::*;

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

          {/* ===================== EDGE MCP ===================== */}
          {activeTab === "hedgehog" && (
            <div className="space-y-6">
              <div data-section="Edge MCP Overview" className="scroll-mt-4">
                <h2 className={`font-mono text-lg flex items-center gap-2 ${isDark ? "text-orange-400" : "text-orange-700"}`}>
                  <BrainCircuit className="w-5 h-5" /> Edge MCP
                </h2>
                <p className={`font-mono text-xs leading-relaxed max-w-2xl mt-2 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                  The Edge MCP is the Model Context Protocol server that bridges AI reasoning with the spatial authentication stack.
                  It routes queries through fast reasoning models with automatic context injection,
                  stores gaze tensor data via encrypted edge storage, and provides a unified API gateway for multi-model AI orchestration.
                </p>
              </div>

              <Card className={`${isDark ? "border-orange-500/20 bg-black/30" : "border-orange-200/30 bg-white/50"}`}>
                <CardHeader className={`p-4 border-b ${isDark ? "border-orange-500/15" : "border-orange-200/20"}`}>
                  <CardTitle data-section="MCP Tools" className={`text-sm flex items-center gap-2 scroll-mt-4 ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                    <Terminal className="w-4 h-4" /> MCP Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {[
                    { tool: "grok_query", desc: "Query AI reasoning engine with automatic spatial context" },
                    { tool: "get_context", desc: "Retrieve current workspace state and project metadata" },
                    { tool: "store_gaze", desc: "Store COG/ENV/EMO tensor data with confidence scores" },
                    { tool: "retrieve_gaze", desc: "Fetch gaze tracking history for a user" },
                    { tool: "analyze_pattern", desc: "AI-powered cognitive, emotional, or environmental analysis" },
                    { tool: "chat", desc: "Multi-model AI chat with automatic routing" },
                    { tool: "gateway", desc: "Secure API proxy with edge-embedded credentials" },
                    { tool: "api_history", desc: "Audit trail of all API calls" },
                    { tool: "api_stats", desc: "Token usage, costs, and success rate metrics" },
                  ].map((t) => (
                    <div key={t.tool} className={`flex items-center gap-3 p-2 rounded border ${isDark ? "bg-black/20 border-orange-500/10" : "bg-white/60 border-orange-200/20"}`}>
                      <code className={`font-mono text-[10px] shrink-0 ${isDark ? "text-cyan-400" : "text-cyan-700"}`}>{t.tool}</code>
                      <span className={`font-mono text-[9px] ml-auto text-right ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{t.desc}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className={`${isDark ? "border-orange-500/20 bg-black/30" : "border-orange-200/30 bg-white/50"}`}>
                <CardHeader className={`p-4 border-b ${isDark ? "border-orange-500/15" : "border-orange-200/20"}`}>
                  <CardTitle data-section="Gateway Pattern" className={`text-sm flex items-center gap-2 scroll-mt-4 ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                    <Lock className="w-4 h-4" /> Gateway Pattern
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <p className={`font-mono text-[10px] ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                    The gateway embeds API credentials server-side so clients never handle keys.
                    All requests are proxied through the MCP protocol on the edge node.
                  </p>
                  <CodeBlock theme={theme} language="python" code={`# Edge MCP Gateway pattern (Python)
import aiohttp
from mcp.server import Server

async def gateway_query(prompt: str, max_tokens: int = 2000):
    """Proxy to AI reasoning engine — key embedded server-side"""
    async with aiohttp.ClientSession() as session:
        resp = await session.post(
            EDGE_AI_ENDPOINT,
            headers={"Authorization": f"Bearer {EDGE_API_KEY}"},
            json={
                "model": "reasoning-fast",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": max_tokens,
            }
        )
        data = await resp.json()
        return data["choices"][0]["message"]["content"]`} />
                </CardContent>
              </Card>

              <Card className={`${isDark ? "border-orange-500/20 bg-black/30" : "border-orange-200/30 bg-white/50"}`}>
                <CardHeader className={`p-4 border-b ${isDark ? "border-orange-500/15" : "border-orange-200/20"}`}>
                  <CardTitle data-section="Usage Examples" className={`text-sm flex items-center gap-2 scroll-mt-4 ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                    <Code2 className="w-4 h-4" /> Usage Examples
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <CodeBlock theme={theme} language="typescript" code={`// Store gaze data from browser MediaPipe pipeline
const storeGaze = async (userId: number, gazeX: number, gazeY: number) => {
  const response = await fetch("/api/gaze/store", {
    method: "POST",
    body: JSON.stringify({
      action: "store_gaze",
      user_id: userId,
      gaze_x: gazeX,    // -1 to 1 normalized
      gaze_y: gazeY,    // -1 to 1 normalized
      cog_value: 0.8,   // AGT tensor weights
      emo_value: 0.1,
      env_value: 0.1,
      confidence: 0.92,
    }),
  });
  return response.json();
};`} />
                  <CodeBlock theme={theme} language="rust" code={`// SpacetimeDB reducer — store gaze event (Rust)
use spacetimedb::spacetimedb;

#[spacetimedb(table)]
pub struct GazeEvent {
    #[primarykey]
    #[autoinc]
    pub id: u64,
    pub user_id: u64,
    pub gaze_x: f64,
    pub gaze_y: f64,
    pub cog: f64,
    pub emo: f64,
    pub env: f64,
    pub confidence: f64,
    pub timestamp: u64,
}

#[spacetimedb(reducer)]
pub fn store_gaze(
    ctx: &ReducerContext,
    user_id: u64,
    gaze_x: f64, gaze_y: f64,
    cog: f64, emo: f64, env: f64,
    confidence: f64,
) -> Result<(), String> {
    GazeEvent::insert(GazeEvent {
        id: 0,
        user_id, gaze_x, gaze_y,
        cog, emo, env, confidence,
        timestamp: ctx.timestamp.to_micros_since_epoch(),
    });
    Ok(())
}`} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* ===================== AARON PROTOCOL ===================== */}
          {activeTab === "aaron" && (
            <div className="space-y-6">
              <div data-section="AARON Protocol Overview" className="scroll-mt-4">
                <h2 className={`font-mono text-lg flex items-center gap-2 ${isDark ? "text-orange-400" : "text-orange-700"}`}>
                  <Fingerprint className="w-5 h-5" /> AARON Protocol
                </h2>
                <p className={`font-mono text-xs leading-relaxed max-w-2xl mt-2 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                  AARON (Adaptive Authentication and Recognition Over Networks) is the biometric proof protocol
                  that underpins the Astro Knots registry. It generates quantum-resistant gaze proofs by encoding
                  AGT tensor sequences into polynomial knot invariants, then anchoring them on Solana via CSTB attestations.
                </p>
              </div>

              <Card className={`${isDark ? "border-orange-500/20 bg-black/30" : "border-orange-200/30 bg-white/50"}`}>
                <CardHeader className={`p-4 border-b ${isDark ? "border-orange-500/15" : "border-orange-200/20"}`}>
                  <CardTitle data-section="Biometric Proof Registry" className={`text-sm flex items-center gap-2 scroll-mt-4 ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                    <Shield className="w-4 h-4" /> Biometric Proof Registry
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <p className={`font-mono text-[10px] ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                    Each gaze verification session produces a JOULE template — a polynomial encoding of the user&apos;s
                    AGT tensor sequence. The AARON protocol hashes this into a knot invariant and stores it on-chain.
                  </p>
                  <CodeBlock theme={theme} language="typescript" code={`// JOULE Template — polynomial gaze encoding
interface JOULETemplate {
  timestamp: number;
  sessionNonce: string;
  expirationWindow: number;          // 30s default
  gazeSequence: GazeTensor[];        // ["COG", "EMO", "ENV", "COG"]
  holdDurations: number[];           // ms per position
  transitionVectors: number[][];     // gaze path between positions
  polynomialEncoding: string;        // "1-2-3-1" (COG=1, EMO=2, ENV=3)
  knotPolynomial: string;            // "AGT-1231-1708123456789"
  verificationHash: string;          // SHA-256 of nonce+sequence+durations
}

// Generate verification hash
async function generateVerificationHash(
  nonce: string,
  sequence: GazeTensor[],
  durations: number[],
  timestamp: number
): Promise<string> {
  const data = nonce + sequence.join(",") + durations.join(",") + timestamp;
  const buffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(data)
  );
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}`} />
                </CardContent>
              </Card>

              <Card className={`${isDark ? "border-orange-500/20 bg-black/30" : "border-orange-200/30 bg-white/50"}`}>
                <CardHeader className={`p-4 border-b ${isDark ? "border-orange-500/15" : "border-orange-200/20"}`}>
                  <CardTitle data-section="Rust Reducers" className={`text-sm flex items-center gap-2 scroll-mt-4 ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                    <Cpu className="w-4 h-4" /> Rust Reducers (SpacetimeDB)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <p className={`font-mono text-[10px] ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                    The AARON registry runs as SpacetimeDB reducers on the edge node.
                    Biometric proofs are validated server-side before on-chain attestation.
                  </p>
                  <CodeBlock theme={theme} language="rust" code={`// AARON biometric proof — SpacetimeDB module (Rust)
use spacetimedb::spacetimedb;
use sha2::{Sha256, Digest};

#[spacetimedb(table)]
pub struct BiometricProof {
    #[primarykey]
    #[autoinc]
    pub id: u64,
    pub user_id: u64,
    pub polynomial_encoding: String,   // "1-2-3-1"
    pub knot_polynomial: String,       // "AGT-1231-..."
    pub verification_hash: String,     // SHA-256
    pub hold_durations_ms: Vec<u64>,
    pub confidence_mean: f64,
    pub verified: bool,
    pub created_at: u64,
}

#[spacetimedb(reducer)]
pub fn submit_biometric_proof(
    ctx: &ReducerContext,
    user_id: u64,
    polynomial: String,
    knot: String,
    hash: String,
    durations: Vec<u64>,
    confidence: f64,
) -> Result<(), String> {
    // Validate minimum confidence threshold
    if confidence < 0.7 {
        return Err("Confidence below 0.7 threshold".into());
    }

    // Validate polynomial format (digits separated by dashes)
    if !polynomial.chars().all(|c| c.is_ascii_digit() || c == '-') {
        return Err("Invalid polynomial encoding".into());
    }

    BiometricProof::insert(BiometricProof {
        id: 0,
        user_id,
        polynomial_encoding: polynomial,
        knot_polynomial: knot,
        verification_hash: hash,
        hold_durations_ms: durations,
        confidence_mean: confidence,
        verified: false,
        created_at: ctx.timestamp.to_micros_since_epoch(),
    });

    log::info!("Biometric proof submitted for user {}", user_id);
    Ok(())
}

#[spacetimedb(reducer)]
pub fn verify_proof(
    ctx: &ReducerContext,
    proof_id: u64,
    nonce: String,
    sequence: Vec<u8>,        // COG=1, EMO=2, ENV=3
    durations: Vec<u64>,
    timestamp: u64,
) -> Result<(), String> {
    let proof = BiometricProof::filter_by_id(&proof_id)
        .ok_or("Proof not found")?;

    // Recompute hash server-side
    let seq_str: String = sequence.iter()
        .map(|t| match t { 1 => "COG", 2 => "EMO", 3 => "ENV", _ => "?" })
        .collect::<Vec<_>>().join(",");
    let dur_str: String = durations.iter()
        .map(|d| d.to_string())
        .collect::<Vec<_>>().join(",");

    let data = format!("{}{}{}{}", nonce, seq_str, dur_str, timestamp);
    let mut hasher = Sha256::new();
    hasher.update(data.as_bytes());
    let computed = format!("{:x}", hasher.finalize());

    if computed != proof.verification_hash {
        return Err("Hash mismatch — proof invalid".into());
    }

    // Mark as verified
    BiometricProof::update_by_id(&proof_id, |p| {
        p.verified = true;
    });

    log::info!("Proof {} verified for user {}", proof_id, proof.user_id);
    Ok(())
}`} />
                </CardContent>
              </Card>

              <Card className={`${isDark ? "border-orange-500/20 bg-black/30" : "border-orange-200/30 bg-white/50"}`}>
                <CardHeader className={`p-4 border-b ${isDark ? "border-orange-500/15" : "border-orange-200/20"}`}>
                  <CardTitle data-section="Client Integration" className={`text-sm flex items-center gap-2 scroll-mt-4 ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                    <Code2 className="w-4 h-4" /> Client Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <p className={`font-mono text-[10px] ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                    After the browser CV pipeline produces a JOULE template, submit it to the AARON registry for on-chain attestation.
                  </p>
                  <CodeBlock theme={theme} language="typescript" code={`// Submit JOULE template to AARON registry
import type { JOULETemplate } from "@/lib/joule/types";

async function submitToAARON(template: JOULETemplate, userId: number) {
  // 1. Submit biometric proof to SpacetimeDB
  const proof = await fetch("/api/aaron/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      polynomial: template.polynomialEncoding,
      knot: template.knotPolynomial,
      hash: template.verificationHash,
      durations: template.holdDurations,
      confidence: 0.85,
    }),
  });

  // 2. Verify proof server-side
  const { proof_id } = await proof.json();
  const verify = await fetch("/api/aaron/verify", {
    method: "POST",
    body: JSON.stringify({
      proof_id,
      nonce: template.sessionNonce,
      sequence: template.gazeSequence.map(
        t => t === "COG" ? 1 : t === "EMO" ? 2 : 3
      ),
      durations: template.holdDurations,
      timestamp: template.timestamp,
    }),
  });

  // 3. On-chain CSTB attestation (if verified)
  if (verify.ok) {
    console.log("AARON proof verified — ready for on-chain attestation");
  }
}`} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* On this page — right TOC sidebar (desktop only) */}
        <div className="hidden xl:block w-48 shrink-0 p-4 relative z-10">
          <div className="sticky top-[69px]">
            <p className={`text-[9px] font-mono uppercase tracking-widest mb-3 flex items-center gap-1 ${isDark ? "text-orange-400/40" : "text-orange-700/60"}`}>
              <ChevronRight className="w-3 h-3" />
              On this page
            </p>
            <div className={`space-y-0.5 border-l ${isDark ? "border-orange-500/10" : "border-orange-300/20"}`}>
              {activeTabConfig.sections.map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`block w-full text-left pl-3 py-1 text-[11px] font-mono transition-all duration-200 border-l-2 -ml-px ${
                    activeSection === section
                      ? isDark
                        ? "border-orange-500 text-orange-400"
                        : "border-orange-500 text-orange-700"
                      : isDark
                        ? "border-transparent text-orange-400/40 hover:text-orange-400/70 hover:border-orange-500/30"
                        : "border-transparent text-orange-700/60 hover:text-orange-700/80 hover:border-orange-400/40"
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DocsPage() {
  return <DocsContent />
}
