"use client"

import { useEffect, useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { Connection, PublicKey, Transaction } from "@solana/web3.js"
import { getAssociatedTokenAddressSync, createTransferInstruction, TOKEN_2022_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAccount } from "@solana/spl-token"
import Link from "next/link"
import Image from "next/image"
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background"
import {
  Check, ExternalLink, ChevronDown,
  Sun, Moon, Zap, LogOut, Eye,
  Sparkles, Crown, Rocket, Lock,
  Keyboard, BrainCircuit, Globe, Heart,
} from "lucide-react"

// ─── Constants ───────────────────────────────────────────────────────────────
const JTX_MINT = "9XpJiKEYzq5yDo5pJzRfjSRMPL2yPfDQXgiN7uYtBhUj"
const FOUNDER_WALLET = "FEUwuvXbbSYTCEhhqgAt2viTsEnromNNDsapoFvyfy3H"
const SOLANA_RPC = process.env.NEXT_PUBLIC_HELIUS_RPC_URL || "https://api.devnet.solana.com"
const JTX_DECIMALS = 9

// ─── Tier Configuration ─────────────────────────────────────────────────────
interface StakeTier {
  id: "mojo" | "dojo" | "unlimited"
  name: string
  jtxAmount: number
  fiatEquiv: string
  duration: string
  durationLabel: string
  optxRate: string
  badge: string
  badgeColor: string
  features: string[]
  highlight: boolean
  glowClass: string
}

const STAKE_TIERS: StakeTier[] = [
  {
    id: "mojo",
    name: "MOJO",
    jtxAmount: 12,
    fiatEquiv: "$8.88/mo",
    duration: "1 YEAR",
    durationLabel: "1 Year Access",
    optxRate: "12 OPTX/month",
    badge: "STARTER",
    badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    features: [
      "12 OPTX mints per month",
      "Jett Native keyboard",
      "Jett Augment customizations",
      "Jett Hub gaze keyboard + emoji packs",
      "Unlimited DOJO training sessions",
      "Beta app access",
    ],
    highlight: false,
    glowClass: "",
  },
  {
    id: "dojo",
    name: "DOJO",
    jtxAmount: 444,
    fiatEquiv: "$28.88/6mo",
    duration: "2 YEARS",
    durationLabel: "2 Year Access",
    optxRate: "444 OPTX/month",
    badge: "POPULAR",
    badgeColor: "bg-orange-500/30 text-orange-300 border-orange-400/40",
    features: [
      "444 OPTX mints per month (2x fiat rate)",
      "Jett Augment customizations",
      "Custom emoji creation via gaze gestures",
      "Augment Net Graph — AR-navigable AGT knowledge graph",
      "Priority Aaron Router access",
      "DePIN node operator eligibility",
      "Unlimited DOJO training sessions",
    ],
    highlight: true,
    glowClass: "shadow-[0_0_40px_rgba(181,82,0,0.15)]",
  },
  {
    id: "unlimited",
    name: "UNLIMITED",
    jtxAmount: 1111,
    fiatEquiv: "$88.88/mo",
    duration: "LIFETIME",
    durationLabel: "Lifetime Access",
    optxRate: "Unlimited OPTX",
    badge: "LEGENDARY",
    badgeColor: "bg-amber-500/30 text-amber-300 border-amber-400/40",
    features: [
      "Unlimited OPTX mints — no cap",
      "Full Jett Augment suite",
      "Full Augment Net Graph + AR navigation",
      "Complete AGT tensor pipeline",
      "Founder-tier Aaron access",
      "Governance voting rights",
      "Future airdrop eligibility",
      "Unlimited DOJO training sessions",
    ],
    highlight: true,
    glowClass: "shadow-[0_0_50px_rgba(217,149,10,0.2)] animate-pulse-glow",
  },
]

// ─── Stake Record (localStorage) ────────────────────────────────────────────
interface StakeRecord {
  tier: "mojo" | "dojo" | "unlimited"
  jtxAmount: number
  walletAddress: string
  txSignature: string
  timestamp: number
  expiresAt: number | null
}

// ─── Star Positions (deterministic) ─────────────────────────────────────────
const STAR_POSITIONS = Array.from({ length: 40 }, (_, i) => ({
  x: ((i * 37 + 13) % 100),
  y: ((i * 53 + 7) % 100),
  delay: ((i * 17) % 30) / 10,
  duration: 2 + ((i * 23) % 30) / 10,
}))

const SHOOTING_STARS = Array.from({ length: 6 }, (_, i) => ({
  startX: ((i * 29 + 5) % 80) + 10,
  startY: ((i * 41 + 3) % 40),
  angle: 25 + ((i * 13) % 20),
  delay: ((i * 31) % 50) / 10,
  duration: 2.5 + ((i * 19) % 20) / 10,
  length: 40 + ((i * 23) % 40),
}))

// ─── Main Component ──────────────────────────────────────────────────────────
export default function StakePage() {
  const { publicKey, connected, disconnect, wallet } = useWallet()
  const { setVisible } = useWalletModal()

  const [darkMode, setDarkMode] = useState(true)

  // Sync theme with localStorage (shared across vault/stake/aaron-docs)
  useEffect(() => {
    const saved = localStorage.getItem("dojo-theme")
    if (saved === "light") setDarkMode(false)
    if (saved === "dark") setDarkMode(true)
  }, [])

  const toggleDarkMode = () => {
    const next = !darkMode
    setDarkMode(next)
    localStorage.setItem("dojo-theme", next ? "dark" : "light")
  }

  const [jtxBalance, setJtxBalance] = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [selectedTier, setSelectedTier] = useState<StakeTier | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [txPending, setTxPending] = useState(false)
  const [txSig, setTxSig] = useState<string | null>(null)
  const [txError, setTxError] = useState<string | null>(null)
  const [existingStakes, setExistingStakes] = useState<StakeRecord[]>([])
  const [walletMenuOpen, setWalletMenuOpen] = useState(false)

  // Theme classes
  const textPrimary = darkMode ? "text-white" : "text-[#1a1a2e]"
  const textSecondary = darkMode ? "text-white/60" : "text-[#1a1a2e]/60"
  const textMuted = darkMode ? "text-white/30" : "text-[#1a1a2e]/30"
  const cardBg = darkMode ? "bg-[#111118] border-orange-500/20" : "bg-white border-orange-200"
  const accentOrange = "text-orange-500"

  // ─── Fetch JTX balance ──────────────────────────────────────────────────────
  const fetchBalance = useCallback(async () => {
    if (!publicKey) { setJtxBalance(null); return }
    setBalanceLoading(true)
    try {
      const conn = new Connection(SOLANA_RPC, "confirmed")
      const mintPubkey = new PublicKey(JTX_MINT)
      const ata = getAssociatedTokenAddressSync(mintPubkey, publicKey, false, TOKEN_2022_PROGRAM_ID)
      const account = await getAccount(conn, ata, "confirmed", TOKEN_2022_PROGRAM_ID)
      setJtxBalance(Number(account.amount) / (10 ** JTX_DECIMALS))
    } catch {
      setJtxBalance(0)
    } finally {
      setBalanceLoading(false)
    }
  }, [publicKey])

  useEffect(() => { fetchBalance() }, [fetchBalance])

  // ─── Load existing stakes from localStorage ────────────────────────────────
  useEffect(() => {
    if (!publicKey) { setExistingStakes([]); return }
    try {
      const raw = localStorage.getItem("jtx-stakes")
      if (raw) {
        const all: StakeRecord[] = JSON.parse(raw)
        const mine = all.filter(s => s.walletAddress === publicKey.toBase58())
        setExistingStakes(mine)
      }
    } catch { /* ignore */ }
  }, [publicKey])

  // ─── Get highest active stake ──────────────────────────────────────────────
  const getActiveTier = (): string | null => {
    const now = Date.now()
    const active = existingStakes.filter(s => s.expiresAt === null || s.expiresAt > now)
    if (active.some(s => s.tier === "unlimited")) return "unlimited"
    if (active.some(s => s.tier === "dojo")) return "dojo"
    if (active.some(s => s.tier === "mojo")) return "mojo"
    return null
  }
  const activeTier = getActiveTier()
  const tierRank = { mojo: 1, dojo: 2, unlimited: 3 }

  // ─── Handle stake transaction ──────────────────────────────────────────────
  const handleStake = async (tier: StakeTier) => {
    if (!connected || !publicKey || !wallet?.adapter) return

    setTxPending(true)
    setTxError(null)
    setTxSig(null)

    try {
      const conn = new Connection(SOLANA_RPC, "confirmed")
      const tx = new Transaction()
      const vaultPubkey = new PublicKey(FOUNDER_WALLET)
      const mintPubkey = new PublicKey(JTX_MINT)

      const senderAta = getAssociatedTokenAddressSync(mintPubkey, publicKey, false, TOKEN_2022_PROGRAM_ID)
      const receiverAta = getAssociatedTokenAddressSync(mintPubkey, vaultPubkey, false, TOKEN_2022_PROGRAM_ID)

      // Check if receiver ATA exists, create if not
      try {
        await getAccount(conn, receiverAta, "confirmed", TOKEN_2022_PROGRAM_ID)
      } catch {
        tx.add(
          createAssociatedTokenAccountInstruction(
            publicKey, receiverAta, vaultPubkey, mintPubkey, TOKEN_2022_PROGRAM_ID,
          )
        )
      }

      tx.add(
        createTransferInstruction(
          senderAta, receiverAta, publicKey,
          BigInt(Math.round(tier.jtxAmount * 10 ** JTX_DECIMALS)),
          [], TOKEN_2022_PROGRAM_ID,
        )
      )

      tx.feePayer = publicKey
      const { blockhash } = await conn.getLatestBlockhash()
      tx.recentBlockhash = blockhash

      const signed = await wallet.adapter.sendTransaction(tx, conn)
      setTxSig(signed)

      // Save stake record
      const record: StakeRecord = {
        tier: tier.id,
        jtxAmount: tier.jtxAmount,
        walletAddress: publicKey.toBase58(),
        txSignature: signed,
        timestamp: Date.now(),
        expiresAt: tier.id === "unlimited" ? null
          : tier.id === "dojo" ? Date.now() + (2 * 365.25 * 24 * 60 * 60 * 1000)
          : Date.now() + (1 * 365.25 * 24 * 60 * 60 * 1000),
      }
      const existing = JSON.parse(localStorage.getItem("jtx-stakes") || "[]")
      existing.push(record)
      localStorage.setItem("jtx-stakes", JSON.stringify(existing))
      setExistingStakes(prev => [...prev, record])

      // Refresh balance
      setTimeout(() => fetchBalance(), 3000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Transaction failed"
      setTxError(msg)
    } finally {
      setTxPending(false)
      setShowConfirm(false)
    }
  }

  const canAfford = (tier: StakeTier) => jtxBalance !== null && jtxBalance >= tier.jtxAmount
  const isTierActive = (tierId: string) => {
    if (!activeTier) return false
    return tierRank[activeTier as keyof typeof tierRank] >= tierRank[tierId as keyof typeof tierRank]
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#0a0a0f]" : "bg-[#f5f0e8]"} ${textPrimary} transition-colors duration-300`}>

      {/* ─── Dark Mode: Stars ─── */}
      {darkMode && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {STAR_POSITIONS.map((star, i) => (
            <div
              key={`star-${i}`}
              className="absolute w-0.5 h-0.5 bg-orange-400/30 rounded-full animate-pulse"
              style={{ left: `${star.x}%`, top: `${star.y}%`, animationDelay: `${star.delay}s`, animationDuration: `${star.duration}s` }}
            />
          ))}
          {SHOOTING_STARS.map((s, i) => (
            <div key={`shoot-${i}`} className="absolute" style={{ left: `${s.startX}%`, top: `${s.startY}%` }}>
              <div
                className="shooting-star"
                style={{ animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s`, width: `${s.length}px`, transform: `rotate(${s.angle}deg)` }}
              />
            </div>
          ))}
          <style>{`
            .shooting-star {
              height: 1px;
              background: linear-gradient(90deg, rgba(251,146,60,0), rgba(251,146,60,0.6), rgba(251,146,60,0));
              animation: shoot linear infinite;
              opacity: 0;
            }
            @keyframes shoot {
              0% { opacity: 0; transform: translateX(-100px) rotate(var(--angle, 25deg)); }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { opacity: 0; transform: translateX(200px) rotate(var(--angle, 25deg)); }
            }
            @keyframes pulse-glow {
              0%, 100% { box-shadow: 0 0 30px rgba(217,149,10,0.15); }
              50% { box-shadow: 0 0 60px rgba(217,149,10,0.3); }
            }
            .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
          `}</style>
        </div>
      )}

      {/* ─── Light Mode ─── */}
      {!darkMode && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <DottedGlowBackground
            opacity={0.4} gap={14} radius={1.5}
            color="rgba(181, 82, 0, 0.2)" glowColor="rgba(181, 82, 0, 0.5)"
            speedMin={0.2} speedMax={0.6} speedScale={0.7}
          />
        </div>
      )}

      {/* ═══ Header ═══ */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 pt-4">
        <nav className="relative flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
          {/* Left: Branding */}
          <Link href="/" className="group flex items-center gap-2">
            <div className="relative w-8 h-8 md:w-6 md:h-6 flex items-center justify-center">
              <span className="relative flex h-full w-full">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" />
                <Image src="/images/astroknots-logo.png" alt="Astro Knots" width={32} height={32} className="relative inline-flex rounded-full object-contain" />
              </span>
            </div>
            <span className={`font-mono text-xs tracking-widest ${darkMode ? "text-white/50" : "text-gray-500"}`}><span className="text-orange-500">JETT</span> Optics</span>
          </Link>

          {/* Center: Nav Pills */}
          <div className={`hidden md:block absolute left-1/2 -translate-x-1/2 rounded-2xl border shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${
            darkMode ? "border-white/[0.08] bg-black/50 backdrop-blur-xl" : "border-black/[0.08] bg-white/80 backdrop-blur-xl"
          }`}>
            <ul className="flex items-center gap-2 px-2 py-1">
              {[
                { label: "VAULT", href: "/vault" },
                { label: "STAKE", href: "/stake", active: true },
                { label: "AARON", href: "/aaron-docs" },
              ].map((link, index) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={`group relative font-mono text-xs tracking-wider px-4 py-2 rounded-xl transition-all duration-300 ${
                      link.active
                        ? darkMode ? "text-orange-400 bg-orange-500/10" : "text-orange-700 bg-orange-100"
                        : darkMode ? "text-white/70 hover:text-white hover:bg-white/[0.08]" : "text-gray-600 hover:text-gray-900 hover:bg-black/5"
                    }`}
                  >
                    <span className="text-orange-500 mr-1">0{index + 1}</span>
                    {link.label}
                    {!link.active && (
                      <span className="absolute bottom-1 left-4 right-4 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Theme + Wallet */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${
                darkMode ? "border-orange-500/30 bg-[#111118] hover:bg-orange-500/10" : "border-orange-300 bg-white hover:bg-orange-50"
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4 text-orange-400" /> : <Moon className="w-4 h-4 text-orange-600" />}
            </button>

            {connected && publicKey ? (
              <div className="relative">
                <button
                  onClick={() => setWalletMenuOpen(!walletMenuOpen)}
                  className={`px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-mono border cursor-pointer transition-all duration-200 ${
                    darkMode ? "border-orange-500/30 bg-[#111118] hover:border-orange-500/60" : "border-orange-300 bg-white hover:border-orange-400"
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                  <ChevronDown className={`w-3 h-3 transition-transform ${walletMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {walletMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setWalletMenuOpen(false)} />
                    <div className={`absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border shadow-2xl p-2 ${
                      darkMode ? "bg-[#0d0d14] border-orange-500/20" : "bg-white border-orange-200"
                    }`}>
                      <div className={`px-3 py-2 mb-1 rounded-lg ${darkMode ? "bg-black/30" : "bg-orange-50"}`}>
                        <p className={`text-[10px] ${textMuted}`}>JTX Balance</p>
                        <p className={`text-sm font-bold font-mono ${accentOrange}`}>
                          {balanceLoading ? "..." : jtxBalance !== null ? `${jtxBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} JTX` : "—"}
                        </p>
                      </div>
                      <button
                        onClick={() => { disconnect(); setWalletMenuOpen(false) }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition-colors ${
                          darkMode ? "text-red-400 hover:bg-red-500/10" : "text-red-600 hover:bg-red-50"
                        }`}
                      >
                        <LogOut className="w-3 h-3" /> Disconnect
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => setVisible(true)}
                className="px-4 py-2 rounded-xl text-xs font-mono bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white transition-all"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* ═══ Main Content ═══ */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 pt-28 pb-20 space-y-10">

        {/* ─── Hero ─── */}
        <section className="text-center space-y-4">
          <h1
            className="text-4xl md:text-5xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-orbitron)" }}
          >
            STAKE <span className={accentOrange}>$JTX</span>
          </h1>
          <p className={`font-mono text-sm md:text-base ${textSecondary} max-w-xl mx-auto leading-relaxed`}>
            Stake JTX. Evolve your mind.<br />
            Your gaze becomes the key. Your stake becomes the fuel.
          </p>
          <p className={`font-mono text-[10px] tracking-wider ${textMuted}`}>
            Unlock OPTX minting, Jett Augment & the Augment Net Graph
          </p>

          {/* Balance display */}
          {connected && publicKey && (
            <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl border ${
              darkMode ? "bg-[#111118] border-orange-500/20" : "bg-white border-orange-200"
            }`}>
              <Image src="/icons/JOE_founder_icon.png" alt="JTX" width={24} height={24} className="rounded-full" />
              <div className="text-left">
                <p className={`text-[9px] font-mono ${textMuted}`}>YOUR BALANCE</p>
                <p className={`text-lg font-bold font-mono ${accentOrange}`}>
                  {balanceLoading ? "..." : jtxBalance !== null ? `${jtxBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} JTX` : "0 JTX"}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ─── Universal Perks Banner ─── */}
        <div className={`rounded-xl border px-4 py-3 flex flex-wrap items-center justify-center gap-4 text-center ${
          darkMode ? "bg-[#111118]/60 border-orange-500/10" : "bg-white/60 border-orange-200/50"
        }`}>
          {[
            { icon: Eye, text: "JETT Auth — always free" },
            { icon: BrainCircuit, text: "Unlimited DOJO sessions" },
            { icon: Keyboard, text: "1 JTX keeps Jett Native keyboard" },
          ].map(item => (
            <div key={item.text} className="flex items-center gap-1.5">
              <item.icon className={`w-3.5 h-3.5 ${accentOrange}`} />
              <span className={`font-mono text-[10px] ${textSecondary}`}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* ─── Tier Cards ─── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STAKE_TIERS.map((tier) => {
            const active = isTierActive(tier.id)
            const affordable = canAfford(tier)
            const isSelected = selectedTier?.id === tier.id

            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl border p-6 flex flex-col transition-all duration-300 ${
                  tier.highlight
                    ? darkMode
                      ? `border-orange-500/40 bg-[#111118] ${tier.glowClass}`
                      : "border-orange-400 bg-white shadow-lg"
                    : darkMode
                      ? "border-orange-500/20 bg-[#111118]"
                      : "border-orange-200 bg-white"
                } ${isSelected ? "ring-2 ring-orange-500" : ""}`}
              >
                {/* Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-full border ${tier.badgeColor}`} style={{ fontFamily: "var(--font-orbitron)" }}>
                    {tier.badge}
                  </span>
                  {active && (
                    <span className="text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                      ACTIVE
                    </span>
                  )}
                </div>

                {/* Tier name */}
                <h2 className={`text-2xl font-bold mb-1 ${accentOrange}`} style={{ fontFamily: "var(--font-orbitron)" }}>
                  {tier.name}
                </h2>

                {/* Amount */}
                <div className="mb-1">
                  <span className="text-3xl font-bold">{tier.jtxAmount.toLocaleString()}</span>
                  <span className={`text-sm ml-1.5 ${textSecondary}`}>JTX</span>
                </div>
                <p className={`text-[10px] font-mono mb-4 ${textMuted}`}>replaces {tier.fiatEquiv} subscription</p>

                {/* Duration pill */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest mb-4 w-fit ${
                  tier.id === "unlimited"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-green-500/15 text-green-400 border border-green-500/25"
                }`} style={{ fontFamily: "var(--font-orbitron)" }}>
                  {tier.id === "unlimited" ? <Crown className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                  {tier.duration}
                </div>

                {/* OPTX rate */}
                <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg ${
                  darkMode ? "bg-orange-500/5 border border-orange-500/10" : "bg-orange-50 border border-orange-200"
                }`}>
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span className={`text-xs font-bold font-mono ${accentOrange}`}>{tier.optxRate}</span>
                  {tier.id === "dojo" && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-bold">2x FIAT</span>}
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className={`text-xs font-mono ${textSecondary}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Action button */}
                {active ? (
                  <button disabled className="w-full py-3 rounded-xl text-sm font-bold font-mono bg-green-500/20 text-green-400 border border-green-500/30 cursor-default">
                    <Check className="w-4 h-4 inline mr-1" /> STAKED
                  </button>
                ) : connected ? (
                  <button
                    onClick={() => { setSelectedTier(tier); setShowConfirm(true); setTxSig(null); setTxError(null) }}
                    disabled={!affordable || txPending}
                    className={`w-full py-3 rounded-xl text-sm font-bold font-mono transition-all ${
                      affordable
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white cursor-pointer"
                        : darkMode
                          ? "bg-white/5 text-white/20 border border-white/10 cursor-not-allowed"
                          : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                    }`}
                  >
                    {affordable ? `STAKE ${tier.jtxAmount.toLocaleString()} JTX` : "INSUFFICIENT BALANCE"}
                  </button>
                ) : (
                  <button
                    onClick={() => setVisible(true)}
                    className="w-full py-3 rounded-xl text-sm font-bold font-mono bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white cursor-pointer transition-all"
                  >
                    CONNECT WALLET
                  </button>
                )}

                {/* Insufficient balance link */}
                {connected && !affordable && !active && (
                  <a
                    href={`https://jup.ag/swap/SOL-${JTX_MINT}`}
                    target="_blank" rel="noopener noreferrer"
                    className="block text-center mt-2 text-[10px] font-mono text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    Get JTX on Jupiter →
                  </a>
                )}
              </div>
            )
          })}
        </section>

        {/* ─── Feature Comparison ─── */}
        <section className={`rounded-2xl border overflow-hidden ${cardBg}`}>
          <div className={`px-6 py-4 border-b ${darkMode ? "border-orange-500/10 bg-black/20" : "border-orange-100 bg-orange-50/50"}`}>
            <h2 className={`text-sm font-bold tracking-widest ${accentOrange}`} style={{ fontFamily: "var(--font-orbitron)" }}>FEATURE COMPARISON</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className={`${darkMode ? "bg-black/20" : "bg-orange-50/50"}`}>
                  <th className={`text-left px-4 py-3 ${textSecondary}`}>Feature</th>
                  <th className="text-center px-4 py-3 text-orange-400">MOJO</th>
                  <th className="text-center px-4 py-3 text-orange-400">DOJO</th>
                  <th className="text-center px-4 py-3 text-amber-400">UNLIMITED</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? "divide-white/5" : "divide-orange-100"}`}>
                {[
                  { feature: "JTX Stake", mojo: "12", dojo: "444", unlimited: "1,111" },
                  { feature: "Plan Duration", mojo: "1 Year", dojo: "2 Years", unlimited: "Lifetime" },
                  { feature: "OPTX Mints/Month", mojo: "12", dojo: "444", unlimited: "∞" },
                  { feature: "JETT Auth", mojo: true, dojo: true, unlimited: true },
                  { feature: "Jett Native Keyboard", mojo: true, dojo: true, unlimited: true },
                  { feature: "Jett Augment", mojo: true, dojo: true, unlimited: true },
                  { feature: "Custom Emoji Packs", mojo: true, dojo: true, unlimited: true },
                  { feature: "DOJO Training", mojo: "Unlimited", dojo: "Unlimited", unlimited: "Unlimited" },
                  { feature: "Augment Net Graph", mojo: false, dojo: true, unlimited: true },
                  { feature: "AR Navigation (OPTX Engine)", mojo: false, dojo: true, unlimited: true },
                  { feature: "Priority Aaron Access", mojo: false, dojo: true, unlimited: true },
                  { feature: "DePIN Node Eligibility", mojo: false, dojo: true, unlimited: true },
                  { feature: "Governance Voting", mojo: false, dojo: false, unlimited: true },
                  { feature: "Future Airdrops", mojo: false, dojo: false, unlimited: true },
                ].map(row => (
                  <tr key={row.feature} className={`${darkMode ? "hover:bg-white/[0.02]" : "hover:bg-orange-50/30"}`}>
                    <td className={`px-4 py-2.5 ${textSecondary}`}>{row.feature}</td>
                    {(["mojo", "dojo", "unlimited"] as const).map(tier => {
                      const val = row[tier]
                      return (
                        <td key={tier} className="text-center px-4 py-2.5">
                          {val === true ? <Check className="w-4 h-4 text-green-400 mx-auto" />
                           : val === false ? <span className={textMuted}>—</span>
                           : <span className={textSecondary}>{val}</span>}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ─── Active Stakes ─── */}
        {existingStakes.length > 0 && (
          <section className={`rounded-2xl border p-6 ${cardBg}`}>
            <h2 className={`text-sm font-bold tracking-widest mb-4 ${accentOrange}`} style={{ fontFamily: "var(--font-orbitron)" }}>YOUR ACTIVE STAKES</h2>
            <div className="space-y-3">
              {existingStakes.map((s, i) => {
                const isExpired = s.expiresAt !== null && s.expiresAt < Date.now()
                return (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${
                    darkMode ? "bg-black/20 border-orange-500/10" : "bg-white border-orange-100"
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold font-mono ${isExpired ? "text-red-400" : accentOrange}`}>
                        {s.tier.toUpperCase()}
                      </span>
                      <span className={`text-xs font-mono ${textSecondary}`}>{s.jtxAmount} JTX</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full ${
                        isExpired ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                      }`}>
                        {isExpired ? "EXPIRED" : s.expiresAt === null ? "LIFETIME" : `Expires ${new Date(s.expiresAt).toLocaleDateString()}`}
                      </span>
                    </div>
                    <a
                      href={`https://solscan.io/tx/${s.txSignature}`}
                      target="_blank" rel="noopener noreferrer"
                      className={`text-[10px] font-mono flex items-center gap-1 ${accentOrange} hover:text-orange-300`}
                    >
                      {s.txSignature.slice(0, 8)}... <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ─── Don't Have JTX? ─── */}
        <section className={`rounded-2xl border p-6 text-center ${cardBg}`}>
          <h2 className={`text-sm font-bold tracking-widest mb-2 ${accentOrange}`} style={{ fontFamily: "var(--font-orbitron)" }}>DON&apos;T HAVE $JTX?</h2>
          <p className={`text-xs font-mono ${textSecondary} mb-4`}>Get JTX on a Solana DEX or donate SOL to the Community Vault</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={`https://jup.ag/swap/SOL-${JTX_MINT}`}
              target="_blank" rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl text-xs font-bold font-mono bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white transition-all flex items-center gap-2"
            >
              <Image src="/icons/jupiter.ico" alt="Jupiter" width={16} height={16} className="rounded-full" />
              Swap on Jupiter
            </a>
            <Link
              href="/vault"
              className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono border transition-all flex items-center gap-2 ${
                darkMode ? "border-orange-500/30 text-orange-400 hover:bg-orange-500/10" : "border-orange-300 text-orange-600 hover:bg-orange-50"
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              Community Vault
            </Link>
          </div>
        </section>

        {/* ─── App Download CTA ─── */}
        <section className={`rounded-2xl border p-6 text-center ${
          darkMode ? "bg-gradient-to-br from-[#111118] to-[#0d0d14] border-orange-500/20" : "bg-gradient-to-br from-white to-orange-50 border-orange-200"
        }`}>
          <Sparkles className={`w-6 h-6 mx-auto mb-2 ${accentOrange}`} />
          <h2 className={`text-sm font-bold tracking-widest mb-1 ${accentOrange}`} style={{ fontFamily: "var(--font-orbitron)" }}>DOWNLOAD THE APP</h2>
          <p className={`text-xs font-mono ${textSecondary} mb-1`}>Get 1 week of DOJO free when you download from iOS or Android</p>
          <p className={`text-[10px] font-mono ${textMuted} mb-4`}>Includes Jett Augment customizations during trial • Downgrades to MOJO after 7 days</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="#" className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono border transition-all ${
              darkMode ? "border-white/10 text-white/60 hover:bg-white/5" : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}>
              <span className="text-orange-400 mr-1">▸</span> App Store — Coming Soon
            </a>
            <a href="#" className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono border transition-all ${
              darkMode ? "border-white/10 text-white/60 hover:bg-white/5" : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}>
              <span className="text-orange-400 mr-1">▸</span> Google Play — Coming Soon
            </a>
          </div>
        </section>

        {/* ─── Footer ─── */}
        <footer className={`text-center pt-6 pb-4 border-t ${darkMode ? "border-white/5" : "border-orange-100"}`}>
          <p className={`text-[10px] font-mono ${textMuted}`}>JETT Optics © 2026 — Stake JTX to power your Augment Net Graph</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <Link href="/vault" className={`text-[10px] font-mono ${textSecondary} hover:text-orange-400 transition-colors`}>Vault</Link>
            <Link href="/docs" className={`text-[10px] font-mono ${textSecondary} hover:text-orange-400 transition-colors`}>Docs</Link>
            <a href="https://x.com/jettoptx" target="_blank" rel="noopener noreferrer" className={`text-[10px] font-mono ${textSecondary} hover:text-orange-400 transition-colors`}>X</a>
          </div>
        </footer>
      </main>

      {/* ═══ Confirmation Modal ═══ */}
      {showConfirm && selectedTier && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setShowConfirm(false); setTxSig(null); setTxError(null) }} />
          <div className={`relative w-full max-w-md rounded-2xl border p-6 space-y-4 ${
            darkMode ? "bg-[#0d0d14] border-orange-500/30" : "bg-white border-orange-200"
          }`}>
            {/* Success state */}
            {txSig ? (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-orbitron)" }}>STAKE CONFIRMED</h3>
                <p className={`text-xs font-mono ${textSecondary}`}>
                  You staked {selectedTier.jtxAmount} JTX for {selectedTier.name} — {selectedTier.durationLabel}
                </p>
                <a
                  href={`https://solscan.io/tx/${txSig}`}
                  target="_blank" rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 text-xs font-mono ${accentOrange} hover:text-orange-300`}
                >
                  View on Solscan <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => { setShowConfirm(false); setTxSig(null) }}
                  className="w-full py-2.5 rounded-xl text-sm font-bold font-mono bg-gradient-to-r from-orange-500 to-orange-600 text-white mt-2"
                >
                  DONE
                </button>
              </div>
            ) : (
              <>
                {/* Confirm state */}
                <div className="text-center">
                  <span className={`text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-full border ${selectedTier.badgeColor}`} style={{ fontFamily: "var(--font-orbitron)" }}>
                    {selectedTier.badge}
                  </span>
                  <h3 className="text-xl font-bold mt-3" style={{ fontFamily: "var(--font-orbitron)" }}>
                    STAKE {selectedTier.jtxAmount.toLocaleString()} JTX
                  </h3>
                  <p className={`text-xs font-mono mt-1 ${textSecondary}`}>
                    Unlock {selectedTier.name} — {selectedTier.durationLabel}
                  </p>
                </div>

                {/* Balance check */}
                <div className={`rounded-xl p-3 border ${darkMode ? "bg-black/20 border-orange-500/10" : "bg-orange-50 border-orange-200"}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono ${textSecondary}`}>Your balance</span>
                    <span className={`text-sm font-bold font-mono ${canAfford(selectedTier) ? "text-green-400" : "text-red-400"}`}>
                      {jtxBalance?.toLocaleString(undefined, { maximumFractionDigits: 2 })} JTX
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs font-mono ${textSecondary}`}>Required</span>
                    <span className={`text-sm font-bold font-mono ${accentOrange}`}>{selectedTier.jtxAmount.toLocaleString()} JTX</span>
                  </div>
                </div>

                {/* Ledger safety note */}
                <div className={`rounded-lg px-3 py-2 ${darkMode ? "bg-white/[0.02] border border-white/5" : "bg-gray-50 border border-gray-200"}`}>
                  <p className={`text-[10px] font-mono ${textMuted} flex items-center gap-1.5`}>
                    <Lock className="w-3 h-3 flex-shrink-0" />
                    If using a Ledger, this transaction will be signed as propose-only.
                  </p>
                </div>

                {/* Error */}
                {txError && (
                  <div className="rounded-lg p-3 bg-red-500/10 border border-red-500/20">
                    <p className="text-xs font-mono text-red-400">{txError}</p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowConfirm(false); setTxError(null) }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-mono border transition-colors ${
                      darkMode ? "border-white/10 text-white/40 hover:bg-white/5" : "border-gray-200 text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleStake(selectedTier)}
                    disabled={txPending || !canAfford(selectedTier)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold font-mono transition-all ${
                      canAfford(selectedTier) && !txPending
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white"
                        : "bg-white/5 text-white/20 cursor-not-allowed"
                    }`}
                  >
                    {txPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing...
                      </span>
                    ) : "CONFIRM STAKE"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
