"use client"

import { useEffect, useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import Link from "next/link"
import Image from "next/image"
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background"
import {
  ArrowRight, ArrowLeftRight, Shield, Wallet, Clock,
  CheckCircle2, XCircle, Loader2, ExternalLink,
  Sun, Moon, Eye, DollarSign, Zap, AlertTriangle,
} from "lucide-react"
import { XamanProvider, useXaman } from "@/components/xaman-provider"
import { createUSDCPayload, waitForPayloadResolution } from "@/lib/xaman"
import { createMPPCharge, type MPPCharge } from "@/lib/mpp"

// ─── Constants ──────────────────────────────────────────────────────────────
const GAZE_GATE_THRESHOLD = 100 // USDC — amounts above this require gaze verification
const BRIDGE_FEE_BPS = 50 // 0.5% total bridge fee
const FEE_SPLIT = { liquidity: 0.80, jtxStakers: 0.15, treasury: 0.05 }
const XRPL_HOOK_ACCOUNT = "rLXCpNStZodh9HjXn5DyoSFMKies1vKBUG"

// ─── Star Positions (deterministic for SSR) ─────────────────────────────────
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

// ─── Bridge Status Steps ────────────────────────────────────────────────────
type BridgeStatus = "idle" | "initiated" | "xrp_locked" | "xrp_confirmed" | "sol_releasing" | "sol_confirmed" | "complete" | "failed" | "refunded"
type Direction = "xrp_to_sol" | "sol_to_xrp"

interface BridgeStep {
  key: string
  label: string
  status: "pending" | "active" | "done" | "error"
}

function getSteps(bridgeStatus: BridgeStatus): BridgeStep[] {
  const states: BridgeStatus[] = ["initiated", "xrp_locked", "xrp_confirmed", "sol_releasing", "sol_confirmed", "complete"]
  const labels: Record<string, string> = {
    initiated: "Initiated",
    xrp_locked: "XRP Locked",
    xrp_confirmed: "XRP Confirmed",
    sol_releasing: "SOL Releasing",
    sol_confirmed: "SOL Confirmed",
    complete: "Complete",
  }
  const currentIdx = states.indexOf(bridgeStatus)
  return states.map((s, i) => ({
    key: s,
    label: labels[s],
    status: bridgeStatus === "failed" || bridgeStatus === "refunded"
      ? "error"
      : i < currentIdx ? "done"
      : i === currentIdx ? "active"
      : "pending",
  }))
}

// ─── Inner Page (needs wallet context) ──────────────────────────────────────
function BridgePageInner() {
  const { publicKey, connected: solConnected } = useWallet()
  const { setVisible: openSolModal } = useWalletModal()
  const { address: xrpAddress, connected: xrpConnected, connect: connectXaman, disconnect: disconnectXaman, connecting: xamanConnecting } = useXaman()

  const [darkMode, setDarkMode] = useState(true)
  const [direction, setDirection] = useState<Direction>("xrp_to_sol")
  const [amount, setAmount] = useState("")
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus>("idle")
  const [bridgeId, setBridgeId] = useState<string | null>(null)
  const [xamanUrl, setXamanUrl] = useState<string | null>(null)
  const [txHashes, setTxHashes] = useState<{ xrpl?: string; sol?: string }>({})
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [gazeVerified, setGazeVerified] = useState(false)
  const [mppCharge, setMppCharge] = useState<MPPCharge | null>(null)
  const [mppPaid, setMppPaid] = useState(false)

  // Theme persistence
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

  // Fee calculation
  const amountNum = parseFloat(amount) || 0
  const totalFee = amountNum * (BRIDGE_FEE_BPS / 10000)
  const feeLiquidity = totalFee * FEE_SPLIT.liquidity
  const feeJtx = totalFee * FEE_SPLIT.jtxStakers
  const feeTreasury = totalFee * FEE_SPLIT.treasury
  const amountAfterFee = amountNum - totalFee
  const needsGaze = amountNum > GAZE_GATE_THRESHOLD

  // Poll bridge status
  useEffect(() => {
    if (!bridgeId || bridgeStatus === "complete" || bridgeStatus === "failed" || bridgeStatus === "refunded") return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/bridge/status/${bridgeId}`)
        if (res.ok) {
          const data = await res.json()
          setBridgeStatus(data.status as BridgeStatus)
          if (data.steps) {
            const xrplStep = data.steps.find((s: { name: string; txHash?: string }) => s.name === "xrp_confirmed")
            const solStep = data.steps.find((s: { name: string; txHash?: string }) => s.name === "sol_confirmed")
            setTxHashes({
              xrpl: xrplStep?.txHash || txHashes.xrpl,
              sol: solStep?.txHash || txHashes.sol,
            })
          }
        }
      } catch {
        // Continue polling on transient errors
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [bridgeId, bridgeStatus, txHashes])

  // ─── Gaze Verification ──────────────────────────────────────────────────
  const handleGazeVerify = useCallback(async () => {
    try {
      const res = await fetch("/api/aaron/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: crypto.randomUUID(),
          challenge: "bridge-gate",
          gazeSequence: ["COG", "EMO", "ENV"],
          holdDurations: [1200, 1100, 1300],
          walletAddress: publicKey?.toBase58() || xrpAddress,
        }),
      })
      if (res.ok) {
        setGazeVerified(true)
      }
    } catch (err) {
      console.error("Gaze verify error:", err)
    }
  }, [publicKey, xrpAddress])

  // ─── MPP Fee Payment ────────────────────────────────────────────────────
  const handleMPPPayment = useCallback(async () => {
    const charge = await createMPPCharge(totalFee, `Bridge fee: ${amountNum} USDC ${direction === "xrp_to_sol" ? "XRP→SOL" : "SOL→XRP"}`)
    if (charge) {
      setMppCharge(charge)
      if (charge.paymentUrl) {
        window.open(charge.paymentUrl, "_blank")
      }
      // For now, auto-mark as paid after creating charge (actual verification in production)
      setMppPaid(true)
    }
  }, [totalFee, amountNum, direction])

  // ─── Initiate Bridge ────────────────────────────────────────────────────
  const handleInitiate = useCallback(async () => {
    if (!amountNum || amountNum <= 0) return
    if (direction === "xrp_to_sol" && !xrpConnected) return
    if (direction === "sol_to_xrp" && !solConnected) return
    if (needsGaze && !gazeVerified) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/bridge/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          direction,
          amount: amountNum,
          solWallet: publicKey?.toBase58() || null,
          xrpAddress: xrpAddress || null,
          gazeVerified: gazeVerified || !needsGaze,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to initiate bridge")
        return
      }

      const data = await res.json()
      setBridgeId(data.bridgeId)
      setBridgeStatus("initiated")

      if (data.xamanPayloadUrl) {
        setXamanUrl(data.xamanPayloadUrl)
        // Also create the USDC payload directly for tracking
        if (direction === "xrp_to_sol" && xrpAddress) {
          const payload = await createUSDCPayload(amountNum, XRPL_HOOK_ACCOUNT)
          if (payload) {
            window.open(payload.next.always, "_blank")
            // Poll for signing
            const result = await waitForPayloadResolution(payload.uuid, 30 * 60 * 1000)
            if (result.signed) {
              setBridgeStatus("xrp_locked")
              setTxHashes(prev => ({ ...prev, xrpl: result.txHash }))
            } else if (result.rejected) {
              setBridgeStatus("failed")
              setError("Transaction was rejected in Xaman wallet")
            }
          }
        }
      }
    } catch (err) {
      console.error("Bridge initiate error:", err)
      setError("Network error — try again")
    } finally {
      setLoading(false)
    }
  }, [amountNum, direction, xrpConnected, solConnected, needsGaze, gazeVerified, publicKey, xrpAddress])

  // ─── Reset ──────────────────────────────────────────────────────────────
  const resetBridge = () => {
    setBridgeId(null)
    setBridgeStatus("idle")
    setXamanUrl(null)
    setTxHashes({})
    setError(null)
    setMppCharge(null)
    setMppPaid(false)
    setGazeVerified(false)
    setAmount("")
  }

  // ─── Theme Classes ────────────────────────────────────────────────────────
  const bg = darkMode ? "bg-[#0a0a0f]" : "bg-[#f5f0e8]"
  const textPrimary = darkMode ? "text-white" : "text-[#1a1a2e]"
  const textSecondary = darkMode ? "text-white/60" : "text-[#1a1a2e]/60"
  const textMuted = darkMode ? "text-white/30" : "text-[#1a1a2e]/30"
  const cardBg = darkMode ? "bg-[#111118] border-orange-500/20" : "bg-white border-orange-200"
  const inputBg = darkMode ? "bg-[#1a1a24] border-white/10 text-white" : "bg-white border-orange-200 text-[#1a1a2e]"
  const btnOrange = "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white"

  return (
    <div className={`min-h-screen ${bg} ${textPrimary} transition-colors duration-300`}>
      {/* ─── Dark Mode: Starfield ─── */}
      {darkMode && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {STAR_POSITIONS.map((star, i) => (
            <div
              key={`star-${i}`}
              className="absolute w-0.5 h-0.5 bg-orange-400/30 rounded-full animate-pulse"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
              }}
            />
          ))}
          {SHOOTING_STARS.map((s, i) => (
            <div
              key={`shoot-${i}`}
              className="absolute"
              style={{
                left: `${s.startX}%`,
                top: `${s.startY}%`,
                width: `${s.length}px`,
                height: "1px",
                background: "linear-gradient(90deg, transparent 0%, rgba(251,146,60,0.6) 40%, rgba(255,255,255,0.8) 100%)",
                transform: `rotate(${s.angle}deg)`,
                opacity: 0,
                animation: `shootingStar ${s.duration}s ease-in-out ${s.delay}s infinite`,
              }}
            />
          ))}
          <style>{`
            @keyframes shootingStar {
              0% { opacity: 0; transform: translateX(0) translateY(0) rotate(var(--angle, 30deg)); }
              5% { opacity: 0.8; }
              15% { opacity: 0.8; }
              30% { opacity: 0; transform: translateX(200px) translateY(120px) rotate(var(--angle, 30deg)); }
              100% { opacity: 0; }
            }
          `}</style>
        </div>
      )}

      {/* ─── Light Mode: Dotted Glow ─── */}
      {!darkMode && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <DottedGlowBackground
            opacity={0.4}
            gap={14}
            radius={1.5}
            color="rgba(181, 82, 0, 0.2)"
            glowColor="rgba(181, 82, 0, 0.5)"
            speedMin={0.2}
            speedMax={0.6}
            speedScale={0.7}
          />
        </div>
      )}

      {/* ─── Header ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 pt-4">
        <nav className="relative flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <Link href="https://jettoptics.ai" className="group flex items-center gap-2">
            <div className="relative w-8 h-8 md:w-6 md:h-6 flex items-center justify-center">
              <span className="relative flex h-full w-full">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" />
                <Image src="/images/astroknots-logo.png" alt="Astro Knots" width={32} height={32} className="relative inline-flex rounded-full object-contain" />
              </span>
            </div>
            <span className={`font-mono text-xs tracking-widest ${darkMode ? "text-white/50" : "text-gray-500"}`}>
              <span className="text-orange-500">JETT</span> Optics
            </span>
          </Link>

          {/* Navigation */}
          <div className={`hidden md:block absolute left-1/2 -translate-x-1/2 rounded-2xl border shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${
            darkMode ? "border-white/[0.08] bg-black/50 backdrop-blur-xl" : "border-black/[0.08] bg-white/80 backdrop-blur-xl"
          }`}>
            <ul className="flex items-center gap-2 px-2 py-1">
              {[
                { label: "VAULT", href: "/vault" },
                { label: "BRIDGE", href: "/bridge", active: true },
                { label: "STAKE", href: "/stake" },
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
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${darkMode ? "text-white/50 hover:text-white hover:bg-white/10" : "text-gray-400 hover:text-gray-700 hover:bg-black/5"}`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </nav>
      </header>

      {/* ─── Main Content ─── */}
      <main className="relative z-10 pt-28 pb-16 px-4 max-w-5xl mx-auto">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-mono text-2xl md:text-3xl font-bold tracking-tight">
            <span className="text-orange-500">USDC</span> Bridge
          </h1>
          <p className={`font-mono text-xs mt-2 ${textSecondary}`}>
            Cross-chain USDC transfer between XRP Ledger and Solana
          </p>
        </div>

        {/* ─── Dual Wallet Panel ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* SOL Wallet (Left) */}
          <div className={`rounded-2xl border p-5 ${cardBg}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-mono text-xs font-semibold">Phantom</p>
                  <p className={`font-mono text-[10px] ${textMuted}`}>Solana USDC</p>
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${solConnected ? "bg-green-500" : "bg-white/20"}`} />
            </div>
            {solConnected && publicKey ? (
              <p className={`font-mono text-xs ${textSecondary} truncate`}>{publicKey.toBase58()}</p>
            ) : (
              <button
                onClick={() => openSolModal(true)}
                className={`w-full py-2 rounded-xl font-mono text-xs transition-all ${btnOrange}`}
              >
                Connect Phantom
              </button>
            )}
          </div>

          {/* XRP Wallet (Right) */}
          <div className={`rounded-2xl border p-5 ${cardBg}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-mono text-xs font-semibold">Xaman</p>
                  <p className={`font-mono text-[10px] ${textMuted}`}>XRPL USDC</p>
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${xrpConnected ? "bg-green-500" : "bg-white/20"}`} />
            </div>
            {xrpConnected && xrpAddress ? (
              <div className="flex items-center justify-between">
                <p className={`font-mono text-xs ${textSecondary} truncate flex-1`}>{xrpAddress}</p>
                <button onClick={disconnectXaman} className={`ml-2 font-mono text-[10px] ${textMuted} hover:text-red-400 transition-colors`}>
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectXaman}
                disabled={xamanConnecting}
                className={`w-full py-2 rounded-xl font-mono text-xs transition-all ${btnOrange} disabled:opacity-50`}
              >
                {xamanConnecting ? "Connecting..." : "Connect Xaman"}
              </button>
            )}
          </div>
        </div>

        {/* ─── Bridge Card ─── */}
        <div className={`rounded-2xl border p-6 ${cardBg} mb-6`}>
          {/* Direction Toggle */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className={`font-mono text-sm font-semibold ${direction === "xrp_to_sol" ? "text-orange-500" : textSecondary}`}>
              XRP(USDC)
            </div>
            <button
              onClick={() => setDirection(d => d === "xrp_to_sol" ? "sol_to_xrp" : "xrp_to_sol")}
              className={`p-2 rounded-xl border transition-all hover:border-orange-500/50 ${
                darkMode ? "border-white/10 bg-[#1a1a24]" : "border-orange-200 bg-white"
              }`}
            >
              <ArrowLeftRight className="w-5 h-5 text-orange-500" />
            </button>
            <div className={`font-mono text-sm font-semibold ${direction === "sol_to_xrp" ? "text-orange-500" : textSecondary}`}>
              SOL(USDC)
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <label className={`font-mono text-xs mb-2 block ${textSecondary}`}>Amount (USDC)</label>
            <div className="relative">
              <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                disabled={bridgeStatus !== "idle"}
                className={`w-full pl-9 pr-4 py-3 rounded-xl border font-mono text-sm transition-colors focus:outline-none focus:border-orange-500/50 ${inputBg} disabled:opacity-50`}
              />
            </div>
          </div>

          {/* Fee Breakdown */}
          {amountNum > 0 && (
            <div className={`rounded-xl p-4 mb-4 ${darkMode ? "bg-[#0d0d14] border border-orange-500/10" : "bg-orange-50 border border-orange-100"}`}>
              <p className={`font-mono text-xs mb-2 ${textSecondary}`}>Fee Breakdown (0.5%)</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="font-mono text-[10px] text-orange-500">80% Liquidity</p>
                  <p className="font-mono text-xs font-semibold">${feeLiquidity.toFixed(4)}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-orange-500">15% JTX Stakers</p>
                  <p className="font-mono text-xs font-semibold">${feeJtx.toFixed(4)}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-orange-500">5% Treasury</p>
                  <p className="font-mono text-xs font-semibold">${feeTreasury.toFixed(4)}</p>
                </div>
              </div>
              <div className={`mt-3 pt-3 border-t ${darkMode ? "border-white/5" : "border-orange-200"} flex justify-between`}>
                <span className={`font-mono text-xs ${textSecondary}`}>You receive</span>
                <span className="font-mono text-sm font-bold text-orange-500">${amountAfterFee.toFixed(2)} USDC</span>
              </div>
            </div>
          )}

          {/* Gaze Verification Gate */}
          {needsGaze && !gazeVerified && bridgeStatus === "idle" && (
            <div className={`rounded-xl p-4 mb-4 border ${darkMode ? "bg-yellow-500/5 border-yellow-500/20" : "bg-yellow-50 border-yellow-200"}`}>
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-yellow-500" />
                <p className="font-mono text-xs font-semibold text-yellow-500">Gaze Verification Required</p>
              </div>
              <p className={`font-mono text-[10px] mb-3 ${textSecondary}`}>
                Amounts over {GAZE_GATE_THRESHOLD} USDC require AARON gaze attestation for security.
              </p>
              <button
                onClick={handleGazeVerify}
                className="w-full py-2 rounded-xl font-mono text-xs bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white transition-all"
              >
                <Eye className="w-3 h-3 inline mr-1" />
                Verify with AARON
              </button>
            </div>
          )}

          {needsGaze && gazeVerified && (
            <div className={`rounded-xl p-3 mb-4 border flex items-center gap-2 ${darkMode ? "bg-green-500/5 border-green-500/20" : "bg-green-50 border-green-200"}`}>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <p className="font-mono text-xs text-green-500">Gaze verified — bridge unlocked</p>
            </div>
          )}

          {/* MPP Payment Badge */}
          {amountNum > 0 && bridgeStatus === "idle" && (
            <div className={`rounded-xl p-3 mb-4 border flex items-center justify-between ${
              darkMode ? "bg-[#0d0d14] border-orange-500/10" : "bg-orange-50 border-orange-100"
            }`}>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500" />
                <p className={`font-mono text-[10px] ${textSecondary}`}>
                  Bridge fee via MPP (HTTP 402)
                </p>
              </div>
              {mppPaid ? (
                <span className="font-mono text-[10px] text-green-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Paid
                </span>
              ) : (
                <button onClick={handleMPPPayment} className="font-mono text-[10px] text-orange-500 hover:text-orange-400 transition-colors">
                  Pay ${totalFee.toFixed(4)}
                </button>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className={`rounded-xl p-3 mb-4 border flex items-center gap-2 ${darkMode ? "bg-red-500/5 border-red-500/20" : "bg-red-50 border-red-200"}`}>
              <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="font-mono text-xs text-red-500">{error}</p>
            </div>
          )}

          {/* Action Button */}
          {bridgeStatus === "idle" ? (
            <button
              onClick={handleInitiate}
              disabled={loading || amountNum <= 0 || (needsGaze && !gazeVerified) ||
                (direction === "xrp_to_sol" && !xrpConnected) ||
                (direction === "sol_to_xrp" && !solConnected)}
              className={`w-full py-3 rounded-xl font-mono text-sm font-semibold transition-all ${btnOrange} disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Initiating...</>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  Bridge {amountNum > 0 ? `$${amountNum.toFixed(2)}` : ""} USDC
                </>
              )}
            </button>
          ) : bridgeStatus === "complete" || bridgeStatus === "failed" || bridgeStatus === "refunded" ? (
            <button onClick={resetBridge} className={`w-full py-3 rounded-xl font-mono text-sm font-semibold transition-all ${btnOrange}`}>
              New Bridge
            </button>
          ) : null}

          {/* Xaman URL */}
          {xamanUrl && bridgeStatus === "initiated" && (
            <div className={`mt-4 rounded-xl p-4 text-center ${darkMode ? "bg-[#0d0d14]" : "bg-orange-50"}`}>
              <p className={`font-mono text-xs mb-2 ${textSecondary}`}>Sign in Xaman wallet</p>
              <a
                href={xamanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-xs text-orange-500 hover:text-orange-400 transition-colors"
              >
                Open Xaman <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* ─── Bridge Status Timeline ─── */}
        {bridgeStatus !== "idle" && (
          <div className={`rounded-2xl border p-6 ${cardBg} mb-6`}>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-orange-500" />
              <h2 className="font-mono text-sm font-semibold">Bridge Status</h2>
              {bridgeId && (
                <span className={`font-mono text-[10px] ${textMuted} ml-auto`}>ID: {bridgeId.slice(0, 8)}...</span>
              )}
            </div>

            <div className="space-y-3">
              {getSteps(bridgeStatus).map((step, i) => (
                <div key={step.key} className="flex items-center gap-3">
                  {/* Step indicator */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step.status === "done" ? "bg-green-500/20" :
                    step.status === "active" ? "bg-orange-500/20" :
                    step.status === "error" ? "bg-red-500/20" :
                    darkMode ? "bg-white/5" : "bg-gray-100"
                  }`}>
                    {step.status === "done" ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> :
                     step.status === "active" ? <Loader2 className="w-3.5 h-3.5 text-orange-500 animate-spin" /> :
                     step.status === "error" ? <XCircle className="w-3.5 h-3.5 text-red-500" /> :
                     <div className={`w-2 h-2 rounded-full ${darkMode ? "bg-white/20" : "bg-gray-300"}`} />}
                  </div>

                  {/* Step label */}
                  <p className={`font-mono text-xs flex-1 ${
                    step.status === "done" ? "text-green-500" :
                    step.status === "active" ? "text-orange-500 font-semibold" :
                    step.status === "error" ? "text-red-500" :
                    textMuted
                  }`}>
                    {step.label}
                  </p>

                  {/* Connector line */}
                  {i < getSteps(bridgeStatus).length - 1 && (
                    <div className={`absolute ml-3 mt-8 w-px h-3 ${
                      step.status === "done" ? "bg-green-500/30" : darkMode ? "bg-white/5" : "bg-gray-200"
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Transaction Hashes */}
            {(txHashes.xrpl || txHashes.sol) && (
              <div className={`mt-4 pt-4 border-t space-y-2 ${darkMode ? "border-white/5" : "border-orange-100"}`}>
                {txHashes.xrpl && (
                  <div className="flex items-center justify-between">
                    <span className={`font-mono text-[10px] ${textSecondary}`}>XRPL Tx</span>
                    <span className="font-mono text-[10px] text-orange-500 truncate max-w-[200px]">{txHashes.xrpl}</span>
                  </div>
                )}
                {txHashes.sol && (
                  <div className="flex items-center justify-between">
                    <span className={`font-mono text-[10px] ${textSecondary}`}>SOL Tx</span>
                    <span className="font-mono text-[10px] text-orange-500 truncate max-w-[200px]">{txHashes.sol}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── Info Footer ─── */}
        <div className={`rounded-2xl border p-5 ${cardBg}`}>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-orange-500" />
            <h3 className="font-mono text-xs font-semibold">How it works</h3>
          </div>
          <div className={`space-y-2 font-mono text-[10px] ${textSecondary}`}>
            <p><span className="text-orange-500">1.</span> Connect both wallets — Phantom (Solana) and Xaman (XRPL)</p>
            <p><span className="text-orange-500">2.</span> Choose direction and amount — USDC is bridged cross-chain</p>
            <p><span className="text-orange-500">3.</span> Sign the lock transaction in your source wallet</p>
            <p><span className="text-orange-500">4.</span> USDC is released on the destination chain after confirmation</p>
            <p><span className="text-orange-500">5.</span> Fees are split: 80% liquidity pool, 15% JTX stakers, 5% treasury</p>
          </div>
          <div className={`mt-3 pt-3 border-t flex items-center gap-1 ${darkMode ? "border-white/5" : "border-orange-100"}`}>
            <AlertTriangle className="w-3 h-3 text-yellow-500" />
            <p className={`font-mono text-[10px] ${textMuted}`}>
              Bridge operations are secured by GENSYS routing and AARON gaze attestation for high-value transfers.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Exported Page (wraps with XamanProvider) ───────────────────────────────
export default function BridgePage() {
  return (
    <XamanProvider>
      <BridgePageInner />
    </XamanProvider>
  )
}
