"use client"

import { useState, useEffect, useCallback } from "react"
import { CheckCircle2, AlertTriangle, XCircle, Clock, Sun, Moon, Activity, Server, Globe, Cpu, MessageSquare, Wifi, Database, Zap, Wallet, RefreshCw, Copy, Check, ExternalLink, Shield } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// ── Wallet addresses ──
const JOE_WALLET = "EFvgELE1Hb4PC5tbPTAe8v1uEDGee8nwYBMCU42bZRGk"
const FOUNDER_WALLET = "FEUwuvXbbSYTCEhhqgAt2viTsEnromNNDsapoFvyfy3H"
const TOKENS = {
  OPTX: { mint: "4r9WoPsRjJzrYEuj6VdwowVrFZaXpu16Qt6xogcmdUXC", decimals: 9, color: "text-orange-400", bg: "bg-orange-500" },
  JTX: { mint: "9XpJiKEYzq5yDo5pJzRfjSRMPL2yPfDQXgiN7uYtBhUj", decimals: 9, color: "text-cyan-400", bg: "bg-cyan-500" },
  CSTB: { mint: "4waAAfTjqf5LNpj2TC5zoeiAgegVwKWoy4WiJgjdBkVL", decimals: 9, color: "text-purple-400", bg: "bg-purple-500" },
}

// ── Mainnet RPC ──
const _heliusKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY || ""
const _network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "mainnet-beta"
const _isMainnet = _network.includes("mainnet")
const SOLANA_RPC = process.env.NEXT_PUBLIC_HELIUS_RPC_URL
  || (_heliusKey ? `https://${_isMainnet ? "mainnet" : "devnet"}.helius-rpc.com/?api-key=${_heliusKey}` : "")
  || (_isMainnet ? "https://api.mainnet-beta.solana.com" : "https://api.devnet.solana.com")

const TOKEN_2022_PROGRAM_ID = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"

// ── Service definitions ──
type ServiceStatus = "operational" | "degraded" | "outage" | "maintenance"

interface Service {
  name: string
  desc: string
  status: ServiceStatus
  icon: typeof Server
  uptime: number
  bars: boolean[]
}

const SERVICES: Service[] = [
  { name: "Astro Knots Vault", desc: "astroknots.space", status: "operational", icon: Globe, uptime: 99.98, bars: Array(90).fill(true) },
  { name: "AARON Router", desc: "Biometric auth + x402", status: "operational", icon: Zap, uptime: 99.95, bars: [...Array(88).fill(true), false, true] },
  { name: "Edge Database", desc: "Real-time encrypted storage", status: "operational", icon: Database, uptime: 99.90, bars: [...Array(85).fill(true), false, ...Array(4).fill(true)] },
  { name: "JOE — Vault Keeper", desc: "Autonomous agent managing the Web4 vault", status: "operational", icon: MessageSquare, uptime: 99.80, bars: [...Array(82).fill(true), false, false, ...Array(6).fill(true)] },
  { name: "Agent Bridge", desc: "Real-time communication", status: "operational", icon: Wifi, uptime: 99.85, bars: [...Array(84).fill(true), false, ...Array(5).fill(true)] },
  { name: "Edge Compute", desc: "Dedicated inference node", status: "operational", icon: Cpu, uptime: 99.70, bars: [...Array(80).fill(true), false, ...Array(9).fill(true)] },
  { name: "Solana RPC", desc: "Mainnet endpoints", status: "operational", icon: Activity, uptime: 99.99, bars: Array(90).fill(true) },
  { name: "Mesh Network", desc: "Encrypted device tunnels", status: "operational", icon: Server, uptime: 99.95, bars: Array(90).fill(true) },
  { name: "Vault Program", desc: "JTX5u...EA7 on mainnet", status: "operational", icon: Shield, uptime: 100, bars: Array(90).fill(true) },
]

const INCIDENTS = [
  {
    id: "inc-002", title: "Edge database restart after update", status: "resolved" as const, severity: "minor" as const, date: "Feb 22, 2026",
    updates: [
      { time: "21:16 MST", message: "All services confirmed operational." },
      { time: "21:00 MST", message: "Stale update processes cleared. Service restarted cleanly." },
    ],
  },
]

// ── Solana RPC helpers ──
async function getSolBalance(address: string): Promise<number> {
  try {
    const res = await fetch(SOLANA_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getBalance", params: [address] }),
    })
    const data = await res.json()
    return (data.result?.value || 0) / 1e9
  } catch { return 0 }
}

async function getTokenBalance(wallet: string, mint: string, decimals: number): Promise<number> {
  try {
    // Try standard getTokenAccountsByOwner with mint filter
    const res = await fetch(SOLANA_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1, method: "getTokenAccountsByOwner",
        params: [wallet, { mint }, { encoding: "jsonParsed" }],
      }),
    })
    const data = await res.json()
    const accounts = data.result?.value || []
    if (accounts.length > 0) {
      const amount = accounts[0].account.data.parsed.info.tokenAmount.amount
      return Number(amount) / Math.pow(10, decimals)
    }

    // Fallback: try Token-2022 program ID (for JTX)
    const res2 = await fetch(SOLANA_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1, method: "getTokenAccountsByOwner",
        params: [wallet, { programId: TOKEN_2022_PROGRAM_ID }, { encoding: "jsonParsed" }],
      }),
    })
    const data2 = await res2.json()
    const accounts2 = data2.result?.value || []
    for (const acc of accounts2) {
      if (acc.account.data.parsed.info.mint === mint) {
        const amount = acc.account.data.parsed.info.tokenAmount.amount
        return Number(amount) / Math.pow(10, decimals)
      }
    }
    return 0
  } catch { return 0 }
}

// ── Components ──
function CopyButton({ text, isDark }: { text: string; isDark: boolean }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <button onClick={copy} className={`p-1 rounded transition-colors ${isDark ? "hover:bg-white/10" : "hover:bg-zinc-100"}`}>
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-500" />}
    </button>
  )
}

function UptimeBar({ bars, isDark }: { bars: boolean[]; isDark: boolean }) {
  return (
    <div className="flex gap-[1px] items-end h-5">
      {bars.map((up, i) => (
        <div key={i} className={`w-[3px] h-full rounded-sm ${up
          ? isDark ? "bg-emerald-500/60" : "bg-emerald-500/50"
          : isDark ? "bg-red-500/70" : "bg-red-500/60"
        }`} title={`Day ${90 - i}: ${up ? "OK" : "Incident"}`} />
      ))}
    </div>
  )
}

export default function StatusPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [walletData, setWalletData] = useState<{
    joe: { sol: number; optx: number; jtx: number; cstb: number }
    founder: { sol: number; optx: number; jtx: number; cstb: number }
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

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

  const fetchBalances = useCallback(async () => {
    setLoading(true)
    try {
      const [joeSol, founderSol, joeOptx, joeJtx, joeCstb, founderOptx, founderJtx, founderCstb] = await Promise.all([
        getSolBalance(JOE_WALLET),
        getSolBalance(FOUNDER_WALLET),
        getTokenBalance(JOE_WALLET, TOKENS.OPTX.mint, TOKENS.OPTX.decimals),
        getTokenBalance(JOE_WALLET, TOKENS.JTX.mint, TOKENS.JTX.decimals),
        getTokenBalance(JOE_WALLET, TOKENS.CSTB.mint, TOKENS.CSTB.decimals),
        getTokenBalance(FOUNDER_WALLET, TOKENS.OPTX.mint, TOKENS.OPTX.decimals),
        getTokenBalance(FOUNDER_WALLET, TOKENS.JTX.mint, TOKENS.JTX.decimals),
        getTokenBalance(FOUNDER_WALLET, TOKENS.CSTB.mint, TOKENS.CSTB.decimals),
      ])
      setWalletData({
        joe: { sol: joeSol, optx: joeOptx, jtx: joeJtx, cstb: joeCstb },
        founder: { sol: founderSol, optx: founderOptx, jtx: founderJtx, cstb: founderCstb },
      })
      setLastFetch(new Date())
    } catch (e) {
      console.error("Failed to fetch balances:", e)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchBalances() }, [fetchBalances])

  const isDark = theme === "dark"
  const allOp = SERVICES.every(s => s.status === "operational")

  const formatBal = (n: number) => {
    if (n === 0) return "0"
    if (n < 0.001) return "<0.001"
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
  }

  const shortAddr = (a: string) => `${a.slice(0, 4)}...${a.slice(-4)}`

  return (
    <div className={`min-h-screen ${isDark ? "bg-zinc-950 text-white" : "bg-stone-50 text-zinc-900"} transition-colors`}>

      {/* Header */}
      <header className={`border-b ${isDark ? "border-zinc-800/50 bg-zinc-950/90" : "border-zinc-200/50 bg-white/90"} backdrop-blur-xl sticky top-0 z-50`}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/astroknots-logo.png" alt="Astro Knots" width={24} height={24} className="rounded-full object-contain" />
            <span className={`font-mono text-sm tracking-wider ${isDark ? "text-white/70" : "text-zinc-600"}`}>
              <span className="text-orange-500 font-bold">ASTRO</span> KNOTS
            </span>
            <span className={`font-mono text-[10px] ml-2 px-2 py-0.5 rounded ${isDark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500"}`}>Status</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/docs" className={`font-mono text-[11px] px-2 py-1 rounded transition-colors ${isDark ? "text-zinc-500 hover:text-white hover:bg-white/5" : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"}`}>Docs</Link>
            <button onClick={toggleTheme} className={`p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-zinc-100"}`}>
              {isDark ? <Sun className="w-3.5 h-3.5 text-zinc-400" /> : <Moon className="w-3.5 h-3.5 text-zinc-500" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">

        {/* Status Banner */}
        <div className={`p-5 rounded-xl border mb-10 ${allOp
          ? isDark ? "border-emerald-500/20 bg-emerald-500/5" : "border-emerald-200 bg-emerald-50/50"
          : isDark ? "border-yellow-500/20 bg-yellow-500/5" : "border-yellow-200 bg-yellow-50/50"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {allOp ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-yellow-500" />}
              <div>
                <h1 className={`font-mono text-base font-bold ${allOp ? "text-emerald-500" : "text-yellow-500"}`}>
                  {allOp ? "All Systems Operational" : "Partial Degradation"}
                </h1>
                <p className={`font-mono text-[10px] mt-0.5 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                  Last incident: {INCIDENTS[0]?.date || "None"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Wallet Balances ═══ */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-mono text-xs uppercase tracking-widest ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
              <Wallet className="w-3.5 h-3.5 inline mr-1.5" />On-Chain Balances
            </h2>
            <button
              onClick={fetchBalances}
              disabled={loading}
              className={`flex items-center gap-1.5 font-mono text-[10px] px-2 py-1 rounded transition-colors ${
                isDark ? "text-zinc-500 hover:text-white hover:bg-white/5" : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
              } ${loading ? "opacity-50" : ""}`}
            >
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              {lastFetch ? `${lastFetch.toLocaleTimeString()}` : "Loading..."}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* JOE — Vault Keeper */}
            <div className={`p-4 rounded-xl border ${isDark ? "border-zinc-800/50 bg-zinc-900/30" : "border-zinc-200 bg-white"}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isDark ? "bg-orange-500/15" : "bg-orange-50"}`}>
                    <Cpu className="w-3 h-3 text-orange-500" />
                  </div>
                  <div>
                    <p className={`font-mono text-xs font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>JOE — Vault Keeper</p>
                    <p className={`font-mono text-[8px] ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Autonomous agent managing the Web4 vault</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <code className={`font-mono text-[9px] ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{shortAddr(JOE_WALLET)}</code>
                  <CopyButton text={JOE_WALLET} isDark={isDark} />
                  <Link href={`https://solscan.io/account/${JOE_WALLET}`} target="_blank" className="p-1">
                    <ExternalLink className="w-3 h-3 text-zinc-500 hover:text-orange-400" />
                  </Link>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: "SOL", value: walletData?.joe.sol, color: "text-violet-400", bg: "bg-violet-500" },
                  { label: "OPTX", value: walletData?.joe.optx, ...TOKENS.OPTX },
                  { label: "JTX", value: walletData?.joe.jtx, ...TOKENS.JTX },
                  { label: "CSTB", value: walletData?.joe.cstb, ...TOKENS.CSTB },
                ].map((t) => (
                  <div key={t.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${t.bg}`} />
                      <span className={`font-mono text-[10px] ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>{t.label}</span>
                    </div>
                    <span className={`font-mono text-sm font-bold ${loading ? "animate-pulse" : ""} ${t.color}`}>
                      {loading ? "—" : formatBal(t.value ?? 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Founder Wallet */}
            <div className={`p-4 rounded-xl border ${isDark ? "border-zinc-800/50 bg-zinc-900/30" : "border-zinc-200 bg-white"}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isDark ? "bg-emerald-500/15" : "bg-emerald-50"}`}>
                    <Wallet className="w-3 h-3 text-emerald-500" />
                  </div>
                  <div>
                    <p className={`font-mono text-xs font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>Founder</p>
                    <p className={`font-mono text-[8px] ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Propose-only ledger</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <code className={`font-mono text-[9px] ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{shortAddr(FOUNDER_WALLET)}</code>
                  <CopyButton text={FOUNDER_WALLET} isDark={isDark} />
                  <Link href={`https://solscan.io/account/${FOUNDER_WALLET}`} target="_blank" className="p-1">
                    <ExternalLink className="w-3 h-3 text-zinc-500 hover:text-orange-400" />
                  </Link>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: "SOL", value: walletData?.founder.sol, color: "text-violet-400", bg: "bg-violet-500" },
                  { label: "OPTX", value: walletData?.founder.optx, ...TOKENS.OPTX },
                  { label: "JTX", value: walletData?.founder.jtx, ...TOKENS.JTX },
                  { label: "CSTB", value: walletData?.founder.cstb, ...TOKENS.CSTB },
                ].map((t) => (
                  <div key={t.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${t.bg}`} />
                      <span className={`font-mono text-[10px] ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>{t.label}</span>
                    </div>
                    <span className={`font-mono text-sm font-bold ${loading ? "animate-pulse" : ""} ${t.color}`}>
                      {loading ? "—" : formatBal(t.value ?? 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className={`font-mono text-[8px] mt-2 text-center ${isDark ? "text-zinc-700" : "text-zinc-300"}`}>
            Mainnet balances • Live from Solana RPC
          </p>
        </section>

        {/* ═══ Token Supply ═══ */}
        <section className="mb-10">
          <h2 className={`font-mono text-xs uppercase tracking-widest mb-4 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
            Token Supply
          </h2>
          <div className="space-y-1.5">
            {[
              { name: "JTX", mint: "9XpJi...hUj", standard: "Token-2022", decimals: 9, price: "$8/token", color: "text-cyan-400" },
              { name: "OPTX", mint: "4r9Wo...UXC", standard: "SPL Token", decimals: 9, price: "Mainnet pending", color: "text-orange-400" },
              { name: "CSTB", mint: "4waAA...kVL", standard: "SPL Token", decimals: 9, price: "—", color: "text-purple-400" },
            ].map((t) => (
              <div key={t.name} className={`p-3 rounded-lg border ${isDark ? "border-zinc-800/40 bg-zinc-900/20" : "border-zinc-200 bg-white"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`font-mono text-xs font-bold ${t.color}`}>{t.name}</span>
                    <span className={`font-mono text-[9px] ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Mint {t.mint}</span>
                    <span className={`font-mono text-[8px] px-1.5 py-0.5 rounded ${isDark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500"}`}>{t.standard}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-[9px] ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{t.decimals} dec</span>
                    <span className={`font-mono text-[9px] ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>{t.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ Services ═══ */}
        <section className="mb-10">
          <h2 className={`font-mono text-xs uppercase tracking-widest mb-4 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
            Services
          </h2>
          <div className="space-y-1.5">
            {SERVICES.map((s) => (
              <div key={s.name} className={`p-3 rounded-lg border transition-colors ${isDark ? "border-zinc-800/40 bg-zinc-900/20 hover:border-zinc-700/40" : "border-zinc-200 bg-white hover:border-zinc-300"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <s.icon className={`w-3.5 h-3.5 ${isDark ? "text-zinc-500" : "text-zinc-400"}`} />
                    <span className={`font-mono text-xs font-medium ${isDark ? "text-white" : "text-zinc-900"}`}>{s.name}</span>
                    <span className={`font-mono text-[9px] ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>{s.desc}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${s.status === "operational" ? "bg-emerald-500" : s.status === "degraded" ? "bg-yellow-500" : "bg-red-500"}`} />
                    <span className={`font-mono text-[10px] ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{s.uptime}%</span>
                  </div>
                </div>
                <UptimeBar bars={s.bars} isDark={isDark} />
              </div>
            ))}
          </div>
        </section>

        {/* ═══ Incidents ═══ */}
        <section className="mb-10">
          <h2 className={`font-mono text-xs uppercase tracking-widest mb-4 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
            Recent Incidents
          </h2>
          {INCIDENTS.map((inc) => (
            <div key={inc.id} className={`p-4 rounded-lg border ${isDark ? "border-zinc-800/40 bg-zinc-900/20" : "border-zinc-200 bg-white"}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className={`font-mono text-xs font-medium ${isDark ? "text-white" : "text-zinc-900"}`}>{inc.title}</h3>
                  <span className={`font-mono text-[8px] px-1.5 py-0.5 rounded border ${isDark ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>{inc.severity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>{inc.status}</span>
                  <span className={`font-mono text-[9px] ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>{inc.date}</span>
                </div>
              </div>
              <div className={`space-y-1.5 pl-3 border-l-2 ${isDark ? "border-zinc-800" : "border-zinc-200"}`}>
                {inc.updates.map((u, i) => (
                  <div key={i}>
                    <span className={`font-mono text-[8px] ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>{u.time}</span>
                    <p className={`font-mono text-[10px] ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{u.message}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Info */}
        <section className={`p-4 rounded-lg border ${isDark ? "border-zinc-800/30 bg-zinc-900/10" : "border-zinc-100 bg-zinc-50"}`}>
          <p className={`font-mono text-[10px] leading-relaxed ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
            Status of the Astro Knots edge infrastructure. All services run on dedicated hardware with WireGuard encryption.
            Wallet balances fetched live from Solana mainnet. Contact{" "}
            <Link href="https://x.com/jettoptx" target="_blank" className="text-orange-500 hover:underline">@jettoptx</Link>.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className={`border-t ${isDark ? "border-zinc-800/50" : "border-zinc-200"}`}>
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
          <p className={`font-mono text-[10px] ${isDark ? "text-zinc-700" : "text-zinc-400"}`}>
            Powered by <Link href="https://jettoptics.ai" className="text-orange-500 hover:underline">Jett Optics.ai</Link> — 100% in-house
          </p>
          <Link href="https://x.com/jettoptx" target="_blank" className={`font-mono text-[10px] ${isDark ? "text-zinc-600 hover:text-orange-400" : "text-zinc-400 hover:text-orange-600"}`}>@jettoptx</Link>
        </div>
      </footer>
    </div>
  )
}
