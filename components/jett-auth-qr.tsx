"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Shield, Eye, Zap, Layers, Loader2, CheckCircle2, XCircle, Smartphone } from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────
interface JettAuthSession {
  sessionId: string
  challenge: string
  expiresAt: number
  qrPayload: string // JSON string for MOJO to scan
}

type AuthState =
  | "idle"        // Not started
  | "generating"  // Creating session challenge
  | "waiting"     // QR displayed, waiting for MOJO scan
  | "verifying"   // MOJO submitted proof, Aaron verifying
  | "success"     // Authenticated
  | "expired"     // Session timed out
  | "error"       // Something went wrong

interface JettAuthQRProps {
  onAuthenticated?: (proof: { sessionId: string; verificationId: string; walletAddress?: string }) => void
  darkMode?: boolean
  compact?: boolean
}

// ─── Component ───────────────────────────────────────────────────────────────
export function JettAuthQR({ onAuthenticated, darkMode = true, compact = false }: JettAuthQRProps) {
  const { publicKey, connected } = useWallet()
  const [authState, setAuthState] = useState<AuthState>("idle")
  const [session, setSession] = useState<JettAuthSession | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ─── Create session challenge ───────────────────────────────────────────
  const createSession = useCallback(async () => {
    setAuthState("generating")
    setError(null)

    try {
      const res = await fetch("/api/aaron/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey?.toBase58() || null,
          origin: typeof window !== "undefined" ? window.location.origin : "",
        }),
      })

      if (!res.ok) throw new Error(`Session creation failed: ${res.status}`)

      const data: JettAuthSession = await res.json()
      setSession(data)
      setAuthState("waiting")
      setTimeLeft(Math.floor((data.expiresAt - Date.now()) / 1000))

      // Start polling for MOJO verification
      startPolling(data.sessionId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session")
      setAuthState("error")
    }
  }, [publicKey])

  // ─── Poll for verification result ──────────────────────────────────────
  const startPolling = useCallback((sessionId: string) => {
    if (pollRef.current) clearInterval(pollRef.current)

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/aaron/verify?sessionId=${sessionId}`)
        if (!res.ok) return

        const data = await res.json()

        if (data.status === "verified") {
          setAuthState("success")
          cleanup()
          onAuthenticated?.({
            sessionId,
            verificationId: data.verificationId,
            walletAddress: data.walletAddress,
          })
        } else if (data.status === "expired") {
          setAuthState("expired")
          cleanup()
        }
      } catch {
        // Silently retry
      }
    }, 2000) // Poll every 2 seconds
  }, [onAuthenticated])

  // ─── Countdown timer ───────────────────────────────────────────────────
  useEffect(() => {
    if (authState === "waiting" && session) {
      timerRef.current = setInterval(() => {
        const remaining = Math.floor((session.expiresAt - Date.now()) / 1000)
        if (remaining <= 0) {
          setAuthState("expired")
          cleanup()
        } else {
          setTimeLeft(remaining)
        }
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [authState, session])

  // ─── Cleanup ───────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  useEffect(() => cleanup, [cleanup])

  // ─── Render ────────────────────────────────────────────────────────────
  const bg = darkMode ? "bg-black/60" : "bg-white/60"
  const border = darkMode ? "border-orange-500/20" : "border-orange-300/40"
  const textPrimary = darkMode ? "text-white" : "text-zinc-900"
  const textMuted = darkMode ? "text-zinc-400" : "text-zinc-500"
  const textAccent = "text-orange-500"

  return (
    <div className={`rounded-2xl border ${border} ${bg} backdrop-blur-md p-6 ${compact ? "max-w-sm" : "max-w-md"} w-full mx-auto`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h3 className={`font-mono text-sm font-semibold tracking-wider ${textPrimary}`}>
            JETT AUTH
          </h3>
          <p className={`font-mono text-[10px] ${textMuted}`}>
            Native Two-Factor · AGT Gaze + On-Chain Proof
          </p>
        </div>
      </div>

      {/* ─── IDLE: Start button ─── */}
      {authState === "idle" && (
        <div className="flex flex-col items-center gap-4">
          <div className={`text-center ${textMuted} font-mono text-xs leading-relaxed`}>
            <p>Sign in with your eyes. Scan the QR code with MOJO to run the 6-step AGT gaze calibration.</p>
          </div>

          {/* How it works — 4 steps */}
          <div className="grid grid-cols-2 gap-2 w-full">
            {[
              { icon: Eye, label: "Private gaze audit", desc: "AARON" },
              { icon: Shield, label: "32-byte proof", desc: "Solana" },
              { icon: Zap, label: "x402 unlocks", desc: "NFT mint" },
              { icon: Layers, label: "Staked tiers", desc: "Layer 3" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className={`flex items-center gap-2 p-2 rounded-lg border ${border} ${darkMode ? "bg-zinc-900/50" : "bg-white/50"}`}>
                <Icon className="w-4 h-4 text-orange-500 shrink-0" />
                <div>
                  <p className={`font-mono text-[10px] ${textPrimary}`}>{label}</p>
                  <p className={`font-mono text-[9px] ${textMuted}`}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={createSession}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-mono text-sm tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
          >
            <Eye className="w-4 h-4" />
            Sign in with Jett Auth
          </button>

          {connected && publicKey && (
            <p className={`font-mono text-[10px] ${textAccent}`}>
              Wallet: {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-4)}
            </p>
          )}
        </div>
      )}

      {/* ─── GENERATING: Loading ─── */}
      {authState === "generating" && (
        <div className="flex flex-col items-center gap-3 py-8">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <p className={`font-mono text-xs ${textMuted}`}>Creating session challenge...</p>
        </div>
      )}

      {/* ─── WAITING: QR Code displayed ─── */}
      {authState === "waiting" && session && (
        <div className="flex flex-col items-center gap-4">
          {/* QR Code */}
          <div className="p-4 bg-white rounded-xl shadow-inner">
            <QRCodeSVG
              value={session.qrPayload}
              size={compact ? 160 : 200}
              level="M"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#18181b"
              imageSettings={{
                src: "/images/astroknots-logo.png",
                x: undefined,
                y: undefined,
                height: compact ? 24 : 32,
                width: compact ? 24 : 32,
                excavate: true,
              }}
            />
          </div>

          {/* Instructions */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Smartphone className="w-4 h-4 text-orange-500" />
              <p className={`font-mono text-xs ${textPrimary}`}>Scan with MOJO</p>
            </div>
            <p className={`font-mono text-[10px] ${textMuted} leading-relaxed`}>
              Open MOJO → Camera → Scan QR → Complete 6-step AGT calibration
            </p>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${border} ${darkMode ? "bg-zinc-900/80" : "bg-zinc-100"}`}>
            <div className={`w-2 h-2 rounded-full ${timeLeft > 30 ? "bg-green-500" : timeLeft > 10 ? "bg-yellow-500 animate-pulse" : "bg-red-500 animate-pulse"}`} />
            <span className={`font-mono text-xs ${textMuted}`}>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </span>
          </div>

          {/* Session ID (truncated) */}
          <p className={`font-mono text-[9px] ${textMuted} opacity-50`}>
            Session: {session.sessionId.slice(0, 12)}...
          </p>
        </div>
      )}

      {/* ─── VERIFYING ─── */}
      {authState === "verifying" && (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="relative">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-500 animate-ping" />
          </div>
          <p className={`font-mono text-xs ${textPrimary}`}>Aaron verifying on-chain proof...</p>
          <p className={`font-mono text-[10px] ${textMuted}`}>Checking CSTB attestation + JTX stake</p>
        </div>
      )}

      {/* ─── SUCCESS ─── */}
      {authState === "success" && (
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-green-400" />
          </div>
          <p className={`font-mono text-sm ${textPrimary}`}>Jett Auth Verified</p>
          <p className={`font-mono text-[10px] ${textMuted}`}>Session authenticated. Entering DOJO...</p>
        </div>
      )}

      {/* ─── EXPIRED ─── */}
      {authState === "expired" && (
        <div className="flex flex-col items-center gap-3 py-6">
          <XCircle className="w-8 h-8 text-yellow-500" />
          <p className={`font-mono text-xs ${textMuted}`}>Session expired</p>
          <button
            onClick={() => { setAuthState("idle"); setSession(null) }}
            className="px-4 py-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 font-mono text-xs transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ─── ERROR ─── */}
      {authState === "error" && (
        <div className="flex flex-col items-center gap-3 py-6">
          <XCircle className="w-8 h-8 text-red-500" />
          <p className={`font-mono text-xs text-red-400`}>{error}</p>
          <button
            onClick={() => { setAuthState("idle"); setError(null) }}
            className="px-4 py-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 font-mono text-xs transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Footer */}
      <div className={`mt-4 pt-3 border-t ${border}`}>
        <p className={`font-mono text-[9px] ${textMuted} text-center`}>
          Powered by AARON Protocol · Private compute, public proof
        </p>
      </div>
    </div>
  )
}
