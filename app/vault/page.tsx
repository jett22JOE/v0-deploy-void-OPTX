"use client"

import { useEffect, useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { Connection, PublicKey } from "@solana/web3.js"
import Link from "next/link"
import {
  Copy, Check, ExternalLink, ChevronDown,
  Sun, Moon, Wallet, Trophy, Clock, HelpCircle,
  Smartphone, Shield, Zap, Globe, Instagram,
  ArrowRight, DollarSign, Box, GitBranch, RotateCcw,
} from "lucide-react"

// ─── Constants ───────────────────────────────────────────────────────────────
const JTX_MINT = "9XpJiKEYzq5yDo5pJzRfjSRMPL2yPfDQXgiN7uYtBhUj"
const JOE_PUBLIC_KEY = "EFvgELE1Hb4PC5tbPTAe8v1uEDGee8nwYBMCU42bZRGk"
const SOLANA_RPC = "https://api.mainnet-beta.solana.com"
const SOL_GOAL = 5874
const SOL_PRICE_EST = 133
const DOLLAR_GOAL = SOL_GOAL * SOL_PRICE_EST // ~$781,242
const GECKO_EMBED = "https://www.geckoterminal.com/solana/pools/9XpJiKEYzq5yDo5pJzRfjSRMPL2yPfDQXgiN7uYtBhUj?embed=1&info=0&swaps=0&grayscale=0&light_chart=0"
const PHASE_1_END = new Date("2026-03-31T23:59:59Z")
const ADMIN_WALLETS = [
  "FEUwuvXbbSYTCEhhqgAt2viTsEnromNNDsapoFvyfy3H", // founder wallet
  // jettoptx.skr wallet — add public key when resolved
]

// ─── Star Positions (deterministic to avoid SSR hydration mismatch) ───────────
const STAR_POSITIONS = Array.from({ length: 40 }, (_, i) => ({
  x: ((i * 37 + 13) % 100),
  y: ((i * 53 + 7) % 100),
  delay: ((i * 17) % 30) / 10,
  duration: 2 + ((i * 23) % 30) / 10,
}))

// ─── FAQ Data ────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  { q: "Is my SOL safe?", a: "Yes. Your funds are secured by smart contract code on Solana. The vault program is non-custodial — no individual can withdraw your SOL. Either the fundraising goal is reached and the pool launches, or you can claim a full refund." },
  { q: "What happens to my donation?", a: "Your SOL is held in the on-chain vault program. When the goal is reached, the SOL is used to create a JTX/SOL liquidity pool on Raydium. Your wallet address is recorded for OPTX airdrop eligibility." },
  { q: "How do refunds work?", a: "If the fundraising goal is not reached by the deadline, you can connect your donor wallet and claim a full refund of your SOL. The refund mechanism is built into the smart contract." },
  { q: "What triggers the pool launch?", a: "When the vault collects 5,874 SOL (approximately $781,242), the Raydium CPMM pool is automatically created with JTX/SOL liquidity at the $8/token target price." },
  { q: "Who controls the vault?", a: "Nobody. The vault is a trustless Solana program. Once deployed, the rules are enforced by code. There is no admin key that can withdraw funds. The only outcomes are pool launch or refund." },
]

// ─── SVG Icons ───────────────────────────────────────────────────────────────
function XIcon({ className }: { className?: string }) {
  return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
}
function FarcasterIcon({ className }: { className?: string }) {
  return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M18.24 2.4H5.76a3.36 3.36 0 0 0-3.36 3.36v12.48a3.36 3.36 0 0 0 3.36 3.36h12.48a3.36 3.36 0 0 0 3.36-3.36V5.76a3.36 3.36 0 0 0-3.36-3.36zm-1.2 13.44c0 .72-.6 1.32-1.32 1.32H8.28c-.72 0-1.32-.6-1.32-1.32V8.16c0-.72.6-1.32 1.32-1.32h7.44c.72 0 1.32.6 1.32 1.32v7.68z" /></svg>
}

// ─── Countdown Hook ──────────────────────────────────────────────────────────
function useCountdown(target: Date) {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const diff = Math.max(0, target.getTime() - now.getTime())
  const days = Math.floor(diff / 86400000)
  const hrs = Math.floor((diff % 86400000) / 3600000)
  const min = Math.floor((diff % 3600000) / 60000)
  const sec = Math.floor((diff % 60000) / 1000)
  return { days, hrs, min, sec }
}

// ─── UTC Clock Hook ──────────────────────────────────────────────────────────
function useUTCClock() {
  const [time, setTime] = useState("")
  useEffect(() => {
    const tick = () => {
      const n = new Date()
      setTime(
        `${String(n.getUTCHours()).padStart(2, "0")}:${String(n.getUTCMinutes()).padStart(2, "0")}:${String(n.getUTCSeconds()).padStart(2, "0")}:${String(n.getUTCMilliseconds()).padStart(3, "0")}Z`
      )
    }
    tick()
    const id = setInterval(tick, 100)
    return () => clearInterval(id)
  }, [])
  return time
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function VaultPage() {
  const { publicKey, connected } = useWallet()
  const { setVisible } = useWalletModal()
  const countdown = useCountdown(PHASE_1_END)
  const utcTime = useUTCClock()

  const [darkMode, setDarkMode] = useState(true)
  const [totalSupply, setTotalSupply] = useState<number | null>(null)
  const [livePrice, setLivePrice] = useState<number | null>(7.67)
  const [marketCap, setMarketCap] = useState<string>("33.7M")
  const [holders, setHolders] = useState<number>(11)
  const [solRaised, setSolRaised] = useState(0)
  const [loading, setLoading] = useState(true)
  const [copiedMint, setCopiedMint] = useState(false)
  const [donateAmount, setDonateAmount] = useState("")
  const [callsign, setCallsign] = useState("")
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [adminOpen, setAdminOpen] = useState(false)
  const [donated, setDonated] = useState(false)
  const [showDevnetModal, setShowDevnetModal] = useState(true)

  const pctRaised = solRaised > 0 ? (solRaised / SOL_GOAL) * 100 : 0
  const dollarRaised = solRaised * SOL_PRICE_EST

  // Share on X after donation
  const shareOnX = (amount: string) => {
    const text = encodeURIComponent(
      `I just contributed ${amount} SOL to the JTX Community Vault! 🚀\n\nEarly donors earn 2x OPTX multiplier. Join the mission:\n\nvault.jettoptics.ai\n\n@jettoptx #JTX #OPTX #Solana #DePIN`
    )
    window.open(`https://x.com/intent/tweet?text=${text}`, "_blank")
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const conn = new Connection(SOLANA_RPC, "confirmed")
      const supply = await conn.getTokenSupply(new PublicKey(JTX_MINT))
      setTotalSupply(supply.value.uiAmount || 0)
    } catch (err) {
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const copyMint = () => {
    navigator.clipboard.writeText(JTX_MINT)
    setCopiedMint(true)
    setTimeout(() => setCopiedMint(false), 2000)
  }

  // Theme classes
  const bg = darkMode ? "bg-[#0a0a0f]" : "bg-[#f5f0e8]"
  const textPrimary = darkMode ? "text-white" : "text-[#1a1a2e]"
  const textSecondary = darkMode ? "text-white/60" : "text-[#1a1a2e]/60"
  const textMuted = darkMode ? "text-white/30" : "text-[#1a1a2e]/30"
  const cardBg = darkMode ? "bg-[#111118] border-orange-500/20" : "bg-white border-orange-200"
  const cardBgAlt = darkMode ? "bg-[#0d0d14] border-orange-500/10" : "bg-white/80 border-orange-100"
  const inputBg = darkMode ? "bg-[#1a1a24] border-white/10 text-white" : "bg-white border-orange-200 text-[#1a1a2e]"
  const accentOrange = "text-orange-500"
  const btnOrange = "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white"

  return (
    <div className={`min-h-screen ${bg} ${textPrimary} transition-colors duration-300`}>
      {/* Animated star background (dark mode only) — deterministic positions to avoid hydration mismatch */}
      {darkMode && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {STAR_POSITIONS.map((star, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-orange-400/30 rounded-full animate-pulse"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Jett Optics Logo — top left, links to jettoptics.ai */}
      <a
        href="https://jettoptics.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed top-4 left-4 z-50 w-12 h-12 rounded-full overflow-hidden border-2 border-orange-500/50 transition-all duration-300 hover:scale-110 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/30 group"
      >
        <img src="/icons/lightLOGOjettoptics.jpeg" alt="Jett Optics" className="w-full h-full object-cover transition-transform duration-300 group-hover:rotate-12" />
      </a>

      {/* Header — top right: dark/light toggle + Connect */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${
            darkMode ? "border-orange-500/30 bg-[#111118] hover:bg-orange-500/10" : "border-orange-300 bg-white hover:bg-orange-50"
          }`}
        >
          {darkMode ? <Sun className="w-4 h-4 text-orange-400" /> : <Moon className="w-4 h-4 text-orange-600" />}
        </button>

        {connected && publicKey ? (
          <div className={`px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-mono border ${
            darkMode ? "border-orange-500/30 bg-[#111118]" : "border-orange-300 bg-white"
          }`}>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
          </div>
        ) : (
          <button
            onClick={() => setVisible(true)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 border transition-colors ${
              darkMode ? "border-orange-500/30 bg-[#111118] hover:bg-orange-500/10 text-white" : "border-orange-300 bg-white hover:bg-orange-50 text-[#1a1a2e]"
            }`}
          >
            <Wallet className="w-4 h-4" /> Connect
          </button>
        )}
      </div>

      <main className="relative z-10 max-w-3xl mx-auto px-4 pt-20 pb-32 space-y-8">
        {/* ═══ Title ═══ */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight" style={{ fontFamily: "var(--font-orbitron)" }}>
            JTX COMMUNITY VAULT
          </h1>
          <p className={`mt-2 text-xs tracking-widest uppercase ${accentOrange}`} style={{ fontFamily: "var(--font-orbitron)" }}>
            Raising {SOL_GOAL.toLocaleString()} SOL to unlock 97,680 JTX tokens ($1.56M liquidity at $8/token)
          </p>
        </div>

        {/* ═══ Mission Status ═══ */}
        <section className={`rounded-2xl border p-6 ${cardBg}`}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingIcon className={`w-5 h-5 ${accentOrange}`} />
            <h2 className="font-bold tracking-widest text-sm" style={{ fontFamily: "var(--font-orbitron)" }}>MISSION STATUS</h2>
          </div>

          <div className="flex items-end justify-between mb-3">
            <div>
              <span className="text-4xl font-black font-mono">{solRaised.toFixed(2)}</span>
              <span className={`text-lg font-mono ${textSecondary}`}>/ {SOL_GOAL.toLocaleString()} SOL</span>
            </div>
            <span className={`text-3xl font-black font-mono ${accentOrange}`}>{pctRaised.toFixed(1)}%</span>
          </div>

          {/* Progress bar */}
          <div className={`w-full h-3 rounded-full ${darkMode ? "bg-white/10" : "bg-orange-100"} mb-6`}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all"
              style={{ width: `${Math.max(pctRaised, 0.5)}%` }}
            />
          </div>

          {/* Countdown */}
          <div className="text-center mb-4">
            <div className={`flex items-center justify-center gap-1 text-xs ${textMuted} mb-3`}>
              <Clock className="w-3 h-3" /> PHASE 1 ENDS (2X OPTX)
            </div>
            <div className="flex items-center justify-center gap-2 font-mono">
              {[
                { val: countdown.days, label: "Days" },
                { val: countdown.hrs, label: "Hrs" },
                { val: countdown.min, label: "Min" },
                { val: countdown.sec, label: "Sec" },
              ].map((item, i) => (
                <div key={item.label} className="flex items-center gap-2">
                  {i > 0 && <span className={`text-xl ${textMuted}`}>:</span>}
                  <div className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center border ${
                    darkMode ? "border-orange-500/20 bg-[#1a1a24]" : "border-orange-200 bg-orange-50"
                  }`}>
                    <span className="text-xl font-bold">{String(item.val).padStart(2, "0")}</span>
                    <span className={`text-[8px] uppercase ${textMuted}`}>{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className={`text-[10px] mt-2 ${textMuted}`}>All times in UTC/GMT</p>
          </div>

          <div className={`flex items-center justify-between text-xs ${textSecondary}`}>
            <span>~${dollarRaised.toLocaleString()} raised of ${DOLLAR_GOAL.toLocaleString()} goal</span>
            <span>Est. at ${SOL_PRICE_EST}/SOL</span>
          </div>
        </section>

        {/* ═══ JTX Token Info ═══ */}
        <section className={`rounded-2xl border p-6 ${cardBg}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-500/30">
              <img src="/icons/lightLOGOjettoptics.jpeg" alt="JTX" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-bold tracking-widest text-sm" style={{ fontFamily: "var(--font-orbitron)" }}>JTX TOKEN INFO</h2>
              <p className={`text-xs ${textSecondary}`}>Jett Optx</p>
            </div>
          </div>

          {/* Price + Market Cap */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={`rounded-xl p-4 border ${darkMode ? "border-orange-500/20 bg-orange-500/5" : "border-orange-200 bg-orange-50"}`}>
              <p className={`text-xs uppercase tracking-wider ${textMuted} mb-1`}>Live Price</p>
              <p className={`text-2xl font-bold ${accentOrange}`}>${livePrice?.toFixed(2) || "---"}</p>
            </div>
            <div className={`rounded-xl p-4 border ${darkMode ? "border-orange-500/20 bg-orange-500/5" : "border-orange-200 bg-orange-50"}`}>
              <p className={`text-xs uppercase tracking-wider ${textMuted} mb-1`}>Market Cap</p>
              <p className="text-2xl font-bold">${marketCap}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-5 gap-2 mb-5">
            {[
              { label: "Total Supply", value: totalSupply ? `${(totalSupply / 1000).toFixed(0)},000 JTX` : "4,400,000 JTX" },
              { label: "Token Standard", value: "Token-2022" },
              { label: "Created", value: "Jan 10, 2026" },
              { label: "Holders", value: String(holders), highlight: true },
              { label: "Network", value: "Solana Mainnet" },
            ].map(s => (
              <div key={s.label} className={`rounded-lg p-2 border text-center ${cardBgAlt}`}>
                <p className={`text-[9px] uppercase tracking-wider ${textMuted}`}>{s.label}</p>
                <p className={`text-xs font-semibold mt-0.5 ${s.highlight ? accentOrange : ""}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Mint address */}
          <div className={`rounded-lg p-3 border ${cardBgAlt} mb-5`}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-xs uppercase tracking-wider ${textMuted}`}>Mint Address</p>
              <button onClick={copyMint} className={`flex items-center gap-1 text-xs ${accentOrange} hover:text-orange-400`}>
                {copiedMint ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedMint ? "Copied" : "Copy"}
              </button>
            </div>
            <p className={`font-mono text-xs break-all ${accentOrange} cursor-pointer`} onClick={copyMint}>
              {JTX_MINT}
            </p>
            <p className={`text-[10px] mt-1 ${textMuted}`}>Click to select, then copy with Ctrl+C / Cmd+C</p>
          </div>

          {/* DEX Links */}
          <div className="mb-4">
            <p className={`text-xs uppercase tracking-wider ${textMuted} mb-2`} style={{ fontFamily: "var(--font-orbitron)" }}>DEX / Liquidity Pools</p>
            <div className="grid grid-cols-4 gap-2">
              {["Jupiter", "Raydium", "Orca", "Meteora"].map(dex => (
                <a key={dex} href={`https://${dex.toLowerCase()}.com`} target="_blank" rel="noopener noreferrer"
                  className={`rounded-lg p-2.5 border text-xs font-medium flex items-center gap-2 transition-colors ${cardBgAlt} hover:border-orange-500/40`}>
                  <span className="w-4 h-4 rounded-full bg-gradient-to-br from-green-400 to-cyan-500 flex-shrink-0" />
                  {dex}
                </a>
              ))}
            </div>
          </div>

          {/* Tracker Links */}
          <div>
            <p className={`text-xs uppercase tracking-wider ${textMuted} mb-2`} style={{ fontFamily: "var(--font-orbitron)" }}>Trackers / Analytics</p>
            <div className="grid grid-cols-3 gap-2">
              {["DexScreener", "Birdeye", "DexTools", "CoinGecko", "CoinMarketCap", "Solscan"].map(t => (
                <a key={t} href={`https://${t.toLowerCase().replace(/\s/g, "")}.com`} target="_blank" rel="noopener noreferrer"
                  className={`rounded-lg p-2.5 border text-xs font-medium flex items-center gap-2 transition-colors ${cardBgAlt} hover:border-orange-500/40`}>
                  <span className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0" />
                  {t}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Price Chart ═══ */}
        <section className={`rounded-2xl border p-6 ${cardBg}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <TrendingIcon className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <h2 className="font-bold tracking-widest text-sm" style={{ fontFamily: "var(--font-orbitron)" }}>PRICE CHART</h2>
              <p className={`text-xs ${textSecondary}`}>JTX/SOL Live Trading Data</p>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden">
            <iframe
              src={GECKO_EMBED}
              title="JTX/SOL Price Chart"
              className="w-full border-0"
              style={{ height: "420px" }}
              sandbox="allow-scripts allow-same-origin"
              loading="lazy"
            />
          </div>
          <div className={`text-center mt-3 text-xs ${textMuted}`}>
            Powered by{" "}
            <a href="https://www.geckoterminal.com" target="_blank" rel="noopener noreferrer" className={`${accentOrange} hover:underline`}>
              View on GeckoTerminal
            </a>
          </div>
        </section>

        {/* ═══ Two-Phase Fundraising ═══ */}
        <section className={`rounded-2xl border p-6 ${cardBg}`}>
          <h2 className="font-bold tracking-widest text-sm mb-1" style={{ fontFamily: "var(--font-orbitron)" }}>TWO-PHASE FUNDRAISING</h2>
          <p className={`text-sm ${textSecondary} mb-5`}>Early donors receive higher OPTX multipliers</p>

          <div className="space-y-3">
            {/* Phase 1 */}
            <div className={`rounded-xl p-5 border-2 ${darkMode ? "border-purple-500/40 bg-purple-500/5" : "border-purple-300 bg-purple-50"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-orange-400" />
                  <span className="font-bold">Phase 1</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-bold uppercase tracking-wider">Active</span>
              </div>
              <p className={`text-sm ${textSecondary}`}>2x OPTX Multiplier (~200 OPTX per 1 SOL)</p>
              <p className={`text-xs ${textMuted} mt-1`}>Ends: March 31, 2026</p>
              <p className="text-xs text-purple-400 mt-2 flex items-center gap-1">
                <Globe className="w-3 h-3" /> Waitlist Beta Access
              </p>
            </div>

            {/* Phase 2 */}
            <div className={`rounded-xl p-5 border ${darkMode ? "border-white/10 bg-white/[0.02]" : "border-gray-200 bg-gray-50"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-white/40" />
                  <span className={`font-bold ${textSecondary}`}>Phase 2</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${darkMode ? "bg-white/10 text-white/40" : "bg-gray-200 text-gray-500"} font-bold uppercase tracking-wider`}>Upcoming</span>
              </div>
              <p className={`text-sm ${textSecondary}`}>1x OPTX Standard (~100 OPTX per 1 SOL)</p>
              <p className={`text-xs ${textMuted} mt-1`}>April 1 - June 30, 2026</p>
              <p className={`text-xs ${textMuted} mt-2 flex items-center gap-1`}>
                <Globe className="w-3 h-3" /> Waitlist Beta Access
              </p>
            </div>
          </div>
        </section>

        {/* ═══ Contribute SOL ═══ */}
        <section className={`rounded-2xl border p-6 ${cardBg}`}>
          <div className="flex items-center gap-2 mb-2">
            <Zap className={`w-5 h-5 ${accentOrange}`} />
            <h2 className="font-bold tracking-widest text-sm" style={{ fontFamily: "var(--font-orbitron)" }}>CONTRIBUTE SOL</h2>
          </div>
          <p className={`text-sm ${textSecondary} mb-5`}>Support the JTX mission by contributing to the pool launch</p>

          {/* Amount input */}
          <div className={`flex items-center rounded-xl border p-3 mb-2 ${inputBg}`}>
            <input
              type="number"
              placeholder="0.00"
              value={donateAmount}
              onChange={e => {
                const val = e.target.value
                if (val === "" || (/^\d*\.?\d{0,9}$/.test(val) && parseFloat(val) <= 10000)) {
                  setDonateAmount(val)
                }
              }}
              className="flex-1 bg-transparent outline-none text-lg font-mono"
              min="0.06"
              max="10000"
              step="0.01"
            />
            <span className={`font-bold text-sm ${accentOrange}`}>SOL</span>
          </div>
          <p className={`text-xs ${textMuted} mb-4`}>Minimum: 0.06 SOL (~$8)</p>

          {/* Callsign */}
          <p className={`text-xs uppercase tracking-wider ${textMuted} mb-1`} style={{ fontFamily: "var(--font-orbitron)" }}>Callsign (optional)</p>
          <input
            type="text"
            placeholder="@yourhandle"
            value={callsign}
            onChange={e => setCallsign(e.target.value.replace(/[^a-zA-Z0-9_@]/g, "").slice(0, 32))}
            maxLength={32}
            className={`w-full rounded-xl border p-3 text-sm mb-1 ${inputBg}`}
          />
          <p className={`text-xs ${textMuted} mb-4`}>Your X handle for the leaderboard</p>

          {/* Preset amounts */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            {["0.5", "1", "5", "10"].map(a => (
              <button
                key={a}
                onClick={() => setDonateAmount(a)}
                className={`rounded-lg py-2 border text-sm font-medium transition-colors ${
                  donateAmount === a
                    ? "border-orange-500 bg-orange-500/10 text-orange-400"
                    : `${cardBgAlt} hover:border-orange-500/40`
                }`}
              >
                {a} SOL
              </button>
            ))}
          </div>

          {/* Donate button — disabled on devnet unless admin */}
          {connected && publicKey && ADMIN_WALLETS.includes(publicKey.toBase58()) ? (
            <button
              onClick={() => setDonated(true)}
              className={`w-full py-4 rounded-xl font-bold text-sm tracking-widest transition-all ${btnOrange}`}
              style={{ fontFamily: "var(--font-orbitron)" }}
            >
              DONATE (ADMIN)
            </button>
          ) : (
            <button
              onClick={() => !connected ? setVisible(true) : null}
              className={`w-full py-4 rounded-xl font-bold text-sm tracking-widest transition-all ${
                connected
                  ? `opacity-60 cursor-not-allowed ${darkMode ? "bg-white/10 text-white/40" : "bg-gray-200 text-gray-400"}`
                  : btnOrange
              }`}
              style={{ fontFamily: "var(--font-orbitron)" }}
              disabled={connected}
            >
              {connected ? "DONATIONS OPEN ON MAINNET" : "CONNECT WALLET TO DONATE"}
            </button>
          )}

          {/* Share on X after donation */}
          {donated && connected && (
            <button
              onClick={() => shareOnX(donateAmount || "0")}
              className={`w-full mt-3 py-3 rounded-xl font-bold text-sm tracking-widest transition-all flex items-center justify-center gap-2 border ${
                darkMode ? "border-white/20 bg-white/5 hover:bg-white/10 text-white" : "border-gray-300 bg-gray-50 hover:bg-gray-100 text-black"
              }`}
              style={{ fontFamily: "var(--font-orbitron)" }}
            >
              <XIcon className="w-4 h-4" /> SHARE ON X FOR OPTX
            </button>
          )}
        </section>

        {/* ═══ Mission Leaders + Mission Log ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className={`rounded-2xl border p-5 ${darkMode ? "bg-[#111118] border-orange-500/20" : "bg-white border-orange-200"}`}>
            <button className={`w-full mb-3 py-2 rounded-lg font-bold text-sm tracking-widest ${btnOrange} flex items-center justify-center gap-2`}
              style={{ fontFamily: "var(--font-orbitron)" }}>
              <Trophy className="w-4 h-4" /> MISSION LEADERS
            </button>
            <p className={`text-[10px] uppercase ${textMuted} mb-4`}>Ranked by total SOL contributed - Click header for full stats</p>
            <div className="flex flex-col items-center justify-center py-8">
              <Trophy className={`w-8 h-8 ${textMuted} mb-2`} />
              <p className={`text-sm ${textSecondary}`}>No contributors yet. Be the first!</p>
            </div>
          </section>

          <section className={`rounded-2xl border p-5 ${darkMode ? "bg-[#111118] border-orange-500/20" : "bg-white border-orange-200"}`}>
            <button className={`w-full mb-3 py-2 rounded-lg font-bold text-sm tracking-widest ${btnOrange} flex items-center justify-center gap-2`}
              style={{ fontFamily: "var(--font-orbitron)" }}>
              <Clock className="w-4 h-4" /> MISSION LOG
            </button>
            <p className={`text-[10px] uppercase ${textMuted} mb-4`}>Latest contributions - Click header for full stats</p>
            <div className="flex flex-col items-center justify-center py-8">
              <Clock className={`w-8 h-8 ${textMuted} mb-2`} />
              <p className={`text-sm ${textSecondary}`}>No contributions yet. Be the first!</p>
            </div>
          </section>
        </div>

        {/* ═══ Jett Optics AI App Early Access ═══ */}
        <section className={`rounded-2xl border p-6 text-center ${cardBg}`}>
          <h2 className="font-bold tracking-widest text-lg mb-2" style={{ fontFamily: "var(--font-orbitron)" }}>
            JETT OPTICS AI APP EARLY ACCESS
          </h2>
          <p className={`text-sm ${textSecondary} mb-5`}>
            All donors receive exclusive beta access to the Jett Optics AI mobile app via TestFlight (iOS) and Google Play Beta (Android)
          </p>

          <div className="flex items-center justify-center gap-3 mb-6">
            <a href="#" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-sm transition-colors">
              <Smartphone className="w-4 h-4" />
              <div className="text-left">
                <p className="text-[9px] uppercase opacity-70">Available on</p>
                <p className="font-bold text-sm">TestFlight</p>
              </div>
            </a>
            <a href="#" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 20.5v-17c0-.83.52-1.28 1-1.45l10 5.72L4 13.45v7.05c-.48-.17-1-.62-1-1zm2-1.04 6.27-3.58L5 12.3v7.16zm1.72-8.53L17.28 5.2 14 3.35 5 8.07l1.72 2.86zM18 12l-3.73-2.13L8 13.45 18 19v-7z" /></svg>
              <div className="text-left">
                <p className="text-[9px] uppercase opacity-70">Get it on</p>
                <p className="font-bold text-sm">Google Play Beta</p>
              </div>
            </a>
          </div>

          {/* Access Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
            {/* Guaranteed */}
            <div className={`rounded-xl p-4 border ${darkMode ? "border-orange-500/30 bg-[#1a1510]" : "border-orange-300 bg-orange-50"}`}>
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-orange-400" />
                <h3 className="font-bold text-orange-400 text-sm">Guaranteed Access</h3>
              </div>
              <p className={`text-xs font-bold ${accentOrange} mb-3`}>250+ OPTX earned</p>
              <ul className={`text-xs ${textSecondary} space-y-1.5`}>
                <li className="flex items-start gap-1.5"><Check className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" /> Priority beta access to Jett Optics AI app</li>
                <li className="flex items-start gap-1.5"><Check className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" /> First to receive TestFlight/Android beta invites</li>
                <li className="flex items-start gap-1.5"><Check className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" /> Exclusive early adopter perks</li>
              </ul>
            </div>
            {/* Discount */}
            <div className={`rounded-xl p-4 border ${darkMode ? "border-purple-500/30 bg-[#12101a]" : "border-purple-300 bg-purple-50"}`}>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-purple-400 text-sm">Discount Access</h3>
              </div>
              <p className="text-xs font-bold text-purple-400 mb-3">75-249 OPTX earned</p>
              <ul className={`text-xs ${textSecondary} space-y-1.5`}>
                <li className="flex items-start gap-1.5"><Check className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" /> Early beta access to Jett Optics AI app</li>
                <li className="flex items-start gap-1.5"><Check className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" /> Faster invite queue for TestFlight/Android</li>
                <li className="flex items-start gap-1.5"><Check className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" /> Supporter recognition</li>
              </ul>
            </div>
            {/* Waitlist */}
            <div className={`rounded-xl p-4 border ${darkMode ? "border-cyan-500/30 bg-[#0a1218]" : "border-cyan-300 bg-cyan-50"}`}>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-cyan-400 text-sm">Waitlist Access</h3>
              </div>
              <p className="text-xs font-bold text-cyan-400 mb-3">Any OPTX earned</p>
              <ul className={`text-xs ${textSecondary} space-y-1.5`}>
                <li className="flex items-start gap-1.5"><Check className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" /> Join the beta waitlist</li>
                <li className="flex items-start gap-1.5"><Check className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" /> Updates on app availability</li>
                <li className="flex items-start gap-1.5"><Check className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" /> Early supporter benefits</li>
              </ul>
            </div>
          </div>

          {/* Claim Beta */}
          <div className={`mt-5 rounded-xl p-4 border text-left ${cardBgAlt}`}>
            <div className="flex items-center gap-2 mb-2">
              <ExternalLink className="w-4 h-4 text-orange-400" />
              <h3 className="font-bold text-sm">Claim Your Beta Access</h3>
            </div>
            <p className={`text-sm ${textSecondary}`}>
              After donating, visit{" "}
              <Link href="/loading" className={`${accentOrange} hover:underline font-semibold`}>jettoptics.ai/loading</Link>
              {" "}to sign up for beta app access based on your tier.
            </p>
            <p className={`text-xs ${textMuted} mt-2`}>Sign up required to receive your beta invite</p>
          </div>
        </section>

        {/* ═══ Donor Rewards ═══ */}
        <section className={`rounded-2xl border p-6 ${cardBg}`}>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className={`w-5 h-5 ${accentOrange}`} />
            <h2 className="font-bold tracking-widest text-sm" style={{ fontFamily: "var(--font-orbitron)" }}>DONOR REWARDS (WALLET-LINKED)</h2>
          </div>
          <p className={`text-sm ${textSecondary} mb-5`}>All rewards automatically linked to your wallet address</p>

          {/* OPTX Airdrops */}
          <h3 className={`text-xs uppercase tracking-wider ${textMuted} mb-3 flex items-center gap-1`} style={{ fontFamily: "var(--font-orbitron)" }}>
            <Zap className="w-3 h-3" /> OPTX Token Airdrops (Tiered)
          </h3>
          <div className="space-y-3 mb-6">
            <div className={`rounded-xl p-4 border ${darkMode ? "border-purple-500/30 bg-purple-500/5" : "border-purple-200 bg-purple-50"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-orange-400" />
                  <span className="font-bold">Phase 1 Donors</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-bold">2x MULTIPLIER</span>
              </div>
              <div className={`text-xs ${textSecondary} space-y-0.5`}>
                <p>Donate before <span className={accentOrange}>March 31, 2026</span></p>
                <p>~200 OPTX per 1 SOL donated</p>
                <p>Airdrop: <span className={accentOrange}>Q1 2027</span></p>
                <p>Vesting: <span className="text-purple-400">50% immediate, 50% over 6 months</span></p>
              </div>
            </div>

            <div className={`rounded-xl p-4 border ${darkMode ? "border-white/10 bg-white/[0.02]" : "border-gray-200 bg-gray-50"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-white/40" />
                  <span className={`font-bold ${textSecondary}`}>Phase 2 Donors</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${darkMode ? "bg-white/10 text-white/40" : "bg-gray-200 text-gray-500"} font-bold`}>1x STANDARD</span>
              </div>
              <div className={`text-xs ${textSecondary} space-y-0.5`}>
                <p>Donate <span className={accentOrange}>April 1 - June 30, 2026</span></p>
                <p>~100 OPTX per 1 SOL donated</p>
                <p>Airdrop: <span className={accentOrange}>Q1 2027</span></p>
                <p>Vesting: <span className="text-purple-400">50% immediate, 50% over 6 months</span></p>
              </div>
            </div>
          </div>

          {/* JettChat Beta */}
          <h3 className={`text-xs uppercase tracking-wider ${textMuted} mb-3`} style={{ fontFamily: "var(--font-orbitron)" }}>
            JettChat Beta (Q3 2026)
          </h3>
          <div className={`rounded-xl p-4 border mb-5 ${darkMode ? "border-green-500/20 bg-green-500/5" : "border-green-200 bg-green-50"}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-green-400" />
              </div>
              <span className="font-bold">Exclusive Beta Testing Access</span>
            </div>
            <ul className={`text-xs ${textSecondary} space-y-1 ml-8`}>
              <li>+ <span className="font-semibold">All Donors (Any amount)</span> - Beta access in <span className={accentOrange}>Q3 2026</span></li>
              <li>+ <span className="font-semibold">OPTX rewards for DOJO subscription</span> - Earn OPTX through app engagement</li>
              <li>+ Features: E2E encrypted messaging, wallet-to-wallet chat, DePIN integration</li>
            </ul>
            <p className={`text-[10px] mt-3 ml-8 ${textMuted} border-t ${darkMode ? "border-white/5" : "border-gray-200"} pt-2`}>
              Beta invites sent automatically to your wallet address
            </p>
          </div>

          {/* Universal Perks */}
          <div className={`rounded-xl p-4 border mb-5 ${cardBgAlt}`}>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className={`w-4 h-4 ${accentOrange}`} />
              <span className="font-bold">Universal Donor Perks (All Amounts)</span>
            </div>
            <ul className={`text-xs ${textSecondary} space-y-1`}>
              <li>Early access to all OPTX ecosystem announcements</li>
              <li>DevNet governance voting rights for OPTX protocol decisions</li>
            </ul>
          </div>

          {/* How Rewards Work */}
          <div className={`rounded-lg p-4 border mb-5 ${cardBgAlt}`}>
            <h3 className={`text-xs uppercase tracking-wider ${textMuted} mb-2`}>How Rewards Work</h3>
            <p className={`text-xs ${textSecondary} leading-relaxed`}>
              All rewards are automatically linked to your wallet address. DeFi/DePIN rewards (OPTX airdrops) require no signup - just connect your wallet. JOE AI access requires account creation at jettoptics.ai. All rewards are non-transferable and tied to the original donor wallet.
            </p>
          </div>

          {/* How to Claim */}
          <div className={`rounded-xl p-4 border ${darkMode ? "border-cyan-500/20 bg-cyan-500/5" : "border-cyan-200 bg-cyan-50"}`}>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm" style={{ fontFamily: "var(--font-orbitron)" }}>HOW TO CLAIM YOUR REWARDS</h3>
            </div>

            <p className={`text-xs font-bold uppercase ${textMuted} mb-2`}>OPTX Airdrops (Q1 2027)</p>
            <ol className={`text-xs ${textSecondary} space-y-1 list-decimal ml-5 mb-4`}>
              <li>Visit the OPTX airdrop portal (link TBA)</li>
              <li>Connect your donor wallet</li>
              <li>Your eligible OPTX amount will display automatically</li>
              <li>Claim directly to your wallet</li>
            </ol>

            <p className={`text-xs font-bold uppercase ${textMuted} mb-2`}>JettChat Beta Access</p>
            <ol className={`text-xs ${textSecondary} space-y-1 list-decimal ml-5 mb-4`}>
              <li>Visit <Link href="/loading" className={`${accentOrange} hover:underline`}>jettoptics.ai/loading</Link> when beta opens</li>
              <li>Create account at <Link href="/" className={`${accentOrange} hover:underline`}>jettoptics.ai</Link> (required for JOE AI)</li>
              <li>Connect your donor wallet to verify eligibility</li>
              <li>Access tier determined automatically based on donation amount</li>
            </ol>

            <p className={`text-xs italic ${accentOrange}`}>
              No manual verification needed - your wallet address is your proof of eligibility. Simply connect the same wallet used for donation.
            </p>
          </div>
        </section>

        {/* ═══ How It Works ═══ */}
        <section className={`rounded-2xl border p-6 ${cardBg}`}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h2 className="font-bold tracking-widest text-sm" style={{ fontFamily: "var(--font-orbitron)" }}>HOW IT WORKS</h2>
              <p className={`text-xs uppercase tracking-wider ${textMuted}`}>The donation mechanism explained</p>
            </div>
          </div>

          {/* Flowchart */}
          <div className="flex flex-wrap items-start justify-center gap-3 mt-6 mb-6">
            {/* Step 1 */}
            <FlowStep num="1" icon={<DollarSign className="w-5 h-5" />} title="Donate SOL" desc="Send SOL to the vault" color="orange" darkMode={darkMode} />
            <ArrowRight className={`w-5 h-5 ${textMuted} mt-8 hidden md:block`} />
            {/* Step 2 */}
            <FlowStep num="2" icon={<Box className="w-5 h-5" />} title="Vault Collects" desc="Secure on-chain storage" color="orange" darkMode={darkMode} />
            <ArrowRight className={`w-5 h-5 ${textMuted} mt-8 hidden md:block`} />
            {/* Step 3 */}
            <FlowStep num="3" icon={<GitBranch className="w-5 h-5" />} title="Goal Reached?" desc="Decision point" color="purple" darkMode={darkMode} />
            <div className="hidden md:flex flex-col items-center gap-2 mt-2">
              <ArrowRight className={`w-5 h-5 ${textMuted}`} />
              {/* 4a */}
              <FlowStep num="4a" icon={<Check className="w-5 h-5" />} title="Pool Launch" desc="Token created on Raydium" color="green" darkMode={darkMode} />
              {/* 4b */}
              <FlowStep num="4b" icon={<RotateCcw className="w-5 h-5" />} title="Refund Available" desc="Get your SOL back" color="yellow" darkMode={darkMode} />
            </div>
            {/* Mobile: 4a/4b inline */}
            <div className="flex md:hidden gap-3 w-full justify-center">
              <FlowStep num="4a" icon={<Check className="w-5 h-5" />} title="Pool Launch" desc="Token created on Raydium" color="green" darkMode={darkMode} />
              <FlowStep num="4b" icon={<RotateCcw className="w-5 h-5" />} title="Refund Available" desc="Get your SOL back" color="yellow" darkMode={darkMode} />
            </div>
          </div>

          <div className={`rounded-lg p-3 border text-center text-xs ${darkMode ? "border-cyan-500/20 bg-cyan-500/5 text-cyan-400" : "border-cyan-300 bg-cyan-50 text-cyan-700"}`}>
            <span className="font-bold">100% trustless mechanism</span> - Your funds are secured by smart contract code, not controlled by any individual. Either the pool launches or you get a full refund.
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className={`rounded-2xl border p-6 ${cardBg}`}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h2 className="font-bold tracking-widest text-sm" style={{ fontFamily: "var(--font-orbitron)" }}>FREQUENTLY ASKED QUESTIONS</h2>
              <p className={`text-xs uppercase tracking-wider ${textMuted}`}>Understanding the vault and donation rewards</p>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {FAQ_ITEMS.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className={`w-full rounded-xl px-4 py-3 flex items-center justify-between text-left font-semibold text-sm transition-colors ${
                    darkMode
                      ? "bg-orange-500/80 hover:bg-orange-500/90 text-white"
                      : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}
                >
                  {faq.q}
                  <ChevronDown className={`w-4 h-4 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className={`px-4 py-3 text-sm ${textSecondary} leading-relaxed`}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ═══ Devnet Notice Modal ═══ */}
      {showDevnetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className={`max-w-md w-full mx-4 rounded-2xl border p-6 shadow-2xl ${
            darkMode ? "bg-[#111118] border-orange-500/30 shadow-orange-500/10" : "bg-white border-orange-200"
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="font-bold text-base" style={{ fontFamily: "var(--font-orbitron)" }}>DEVNET PREVIEW</h3>
                <p className={`text-xs ${textMuted}`}>vault.jettoptics.ai</p>
              </div>
            </div>

            <div className={`rounded-xl p-4 mb-4 border ${darkMode ? "border-yellow-500/20 bg-yellow-500/5" : "border-yellow-300 bg-yellow-50"}`}>
              <p className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-2">Development Notice</p>
              <p className={`text-sm ${textSecondary} leading-relaxed`}>
                The JTX Community Vault is currently operating on <span className="font-bold text-orange-400">Solana devnet</span>.
                Full on-chain functionality including SOL donations, x402 agent payments, and Raydium pool launch
                will go live on <span className="font-bold text-orange-400">mainnet</span> once the JETT DePIN gaze authentication
                system is verified in DOJO.
              </p>
            </div>

            <div className={`space-y-2 text-xs ${textSecondary} mb-5`}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span>Smart contract audit in progress (Anchor 0.30.1)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                <span>JETT gaze auth DePIN testing in DOJO</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                <span>OPTX token mainnet deployment pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <span>Estimated mainnet launch: ~4 weeks</span>
              </div>
            </div>

            <p className={`text-[10px] ${textMuted} mb-4 leading-relaxed`}>
              You can explore the vault interface, view live JTX price data, and connect your wallet.
              Donations are disabled until mainnet launch. No funds are at risk.
            </p>

            <button
              onClick={() => setShowDevnetModal(false)}
              className={`w-full py-3 rounded-xl font-bold text-sm tracking-widest transition-all ${btnOrange}`}
              style={{ fontFamily: "var(--font-orbitron)" }}
            >
              I UNDERSTAND — EXPLORE VAULT
            </button>
          </div>
        </div>
      )}

      {/* ═══ Admin Terminal (bottom-left logo) — founder wallet only ═══ */}
      {connected && publicKey && ADMIN_WALLETS.includes(publicKey.toBase58()) && (
        <button
          onClick={() => setAdminOpen(!adminOpen)}
          className="fixed bottom-14 left-4 z-50 w-10 h-10 rounded-full overflow-hidden border-2 border-orange-500/30 transition-all duration-300 hover:scale-110 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/30 group cursor-pointer"
          title="Admin Terminal"
        >
          <img src="/icons/lightLOGOjettoptics.jpeg" alt="Admin" className="w-full h-full object-cover opacity-60 transition-all duration-300 group-hover:opacity-100 group-hover:rotate-12" />
        </button>
      )}

      {/* Admin Terminal Panel */}
      {adminOpen && connected && publicKey && ADMIN_WALLETS.includes(publicKey.toBase58()) && (
        <div className={`fixed bottom-24 left-4 z-50 w-96 max-h-[70vh] overflow-y-auto rounded-2xl border shadow-2xl p-5 ${
          darkMode ? "bg-[#0d0d14] border-orange-500/20 shadow-orange-500/10" : "bg-white border-orange-200 shadow-orange-200/30"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm tracking-widest" style={{ fontFamily: "var(--font-orbitron)" }}>
              VAULT ADMIN TERMINAL
            </h3>
            <button onClick={() => setAdminOpen(false)} className={`text-xs ${textMuted} hover:text-orange-400`}>
              [close]
            </button>
          </div>

          <div className={`space-y-3 font-mono text-xs ${textSecondary}`}>
            <div className={`p-3 rounded-lg ${darkMode ? "bg-black/30" : "bg-gray-50"}`}>
              <p className={`${accentOrange} font-bold mb-1`}>Vault Program</p>
              <p>Status: <span className="text-green-400">ACTIVE</span></p>
              <p>Network: Solana Mainnet</p>
              <p>Phase: 1 (2x OPTX)</p>
            </div>

            <div className={`p-3 rounded-lg ${darkMode ? "bg-black/30" : "bg-gray-50"}`}>
              <p className={`${accentOrange} font-bold mb-1`}>Fundraising</p>
              <p>Goal: {SOL_GOAL.toLocaleString()} SOL (${DOLLAR_GOAL.toLocaleString()})</p>
              <p>Raised: {solRaised.toFixed(2)} SOL ({pctRaised.toFixed(1)}%)</p>
              <p>Est. SOL/USD: ${SOL_PRICE_EST}</p>
              <p>Target JTX Price: $8.00</p>
            </div>

            <div className={`p-3 rounded-lg ${darkMode ? "bg-black/30" : "bg-gray-50"}`}>
              <p className={`${accentOrange} font-bold mb-1`}>Token Stats</p>
              <p>JTX Mint: {JTX_MINT.slice(0, 8)}...{JTX_MINT.slice(-6)}</p>
              <p>Supply: {totalSupply ? totalSupply.toLocaleString() : "Loading..."}</p>
              <p>Standard: Token-2022</p>
              <p>Holders: {holders}</p>
              <p>Live Price: ${livePrice?.toFixed(2) || "---"}</p>
              <p>Market Cap: ${marketCap}</p>
            </div>

            <div className={`p-3 rounded-lg ${darkMode ? "bg-black/30" : "bg-gray-50"}`}>
              <p className={`${accentOrange} font-bold mb-1`}>Agent Wallet (JOE)</p>
              <p>Address: {JOE_PUBLIC_KEY.slice(0, 8)}...{JOE_PUBLIC_KEY.slice(-6)}</p>
              <p>Protocol: ERC-8004</p>
              <p>Signing: Deferred (seeker phone)</p>
            </div>

            <div className={`p-3 rounded-lg ${darkMode ? "bg-black/30" : "bg-gray-50"}`}>
              <p className={`${accentOrange} font-bold mb-1`}>Domains</p>
              <p>vault.jettoptics.ai → Vercel (Web2)</p>
              <p>astro.knots.sol → SNS mask</p>
              <p>jettoptx.dev → JOE Agent (Conway)</p>
            </div>

            <div className={`p-3 rounded-lg ${darkMode ? "bg-black/30" : "bg-gray-50"}`}>
              <p className={`${accentOrange} font-bold mb-1`}>Phase Timeline</p>
              <p>Phase 1: Now → March 31, 2026 (2x)</p>
              <p>Phase 2: Apr 1 → June 30, 2026 (1x)</p>
              <p>OPTX Airdrop: Q1 2027</p>
              <p>JettChat Beta: Q3 2026</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Sticky Footer ═══ */}
      <footer className={`fixed bottom-0 left-0 right-0 z-40 border-t py-2 px-4 ${
        darkMode ? "bg-[#0a0a0f]/95 border-white/5 backdrop-blur-md" : "bg-white/95 border-orange-100 backdrop-blur-md"
      }`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Left: social icons */}
          <div className="flex items-center gap-3">
            <a href="https://jettoptics.ai" target="_blank" rel="noopener noreferrer" className={`text-xs ${textSecondary} hover:${accentOrange} transition-colors`}>
              jettoptics.ai
            </a>
            <span className={textMuted}>|</span>
            <span className={`text-xs ${textMuted}`}>&copy; 2026</span>
            <div className="flex items-center gap-2 ml-2">
              <a href="https://instagram.com/jettoptx" target="_blank" rel="noopener noreferrer" className={`${textMuted} hover:text-orange-400 transition-colors`}>
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a href="https://x.com/jettoptx" target="_blank" rel="noopener noreferrer" className={`${textMuted} hover:text-orange-400 transition-colors`}>
                <XIcon className="w-3.5 h-3.5" />
              </a>
              <a href="https://zora.co" target="_blank" rel="noopener noreferrer" className={`${textMuted} hover:text-orange-400 transition-colors`}>
                <span className="text-[10px] font-bold">Z</span>
              </a>
              <a href="https://warpcast.com" target="_blank" rel="noopener noreferrer" className={`${textMuted} hover:text-orange-400 transition-colors`}>
                <FarcasterIcon className="w-3.5 h-3.5" />
              </a>
              <a href="#" className={`${textMuted} hover:text-orange-400 transition-colors`}>
                <Globe className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right: contact + UTC */}
          <div className="flex items-center gap-4">
            <span className={`text-xs ${accentOrange}`}>Contact: founder@jettoptics.ai</span>
            <span className={`text-xs font-mono ${textMuted}`}>UTC(GMT) - {utcTime}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ─── Flow Step Component ─────────────────────────────────────────────────────
function FlowStep({ num, icon, title, desc, color, darkMode }: {
  num: string; icon: React.ReactNode; title: string; desc: string; color: string; darkMode: boolean
}) {
  const colors: Record<string, string> = {
    orange: darkMode ? "border-orange-500/30 bg-[#1a1510]" : "border-orange-200 bg-orange-50",
    purple: darkMode ? "border-purple-500/30 bg-[#12101a]" : "border-purple-200 bg-purple-50",
    green: darkMode ? "border-green-500/30 bg-[#0a1510]" : "border-green-200 bg-green-50",
    yellow: darkMode ? "border-yellow-500/30 bg-[#1a1810]" : "border-yellow-200 bg-yellow-50",
  }
  const numColors: Record<string, string> = {
    orange: "bg-orange-500",
    purple: "bg-purple-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
  }
  return (
    <div className={`relative rounded-xl border p-4 w-28 text-center ${colors[color]}`}>
      <div className={`absolute -top-2 -left-2 w-5 h-5 rounded-full ${numColors[color]} text-white text-[10px] font-bold flex items-center justify-center`}>
        {num}
      </div>
      <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2 ${darkMode ? "bg-white/5" : "bg-black/5"}`}>
        {icon}
      </div>
      <p className="text-xs font-bold">{title}</p>
      <p className={`text-[10px] ${darkMode ? "text-white/40" : "text-black/40"} mt-0.5`}>{desc}</p>
    </div>
  )
}

// ─── Trending Icon (chart line) ──────────────────────────────────────────────
function TrendingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 20l5.5-5.5L12 17l7-7m0 0h-4m4 0v4" />
    </svg>
  )
}
