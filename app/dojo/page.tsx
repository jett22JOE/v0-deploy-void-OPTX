"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSafeAuth, useSafeUser } from "@/lib/hooks/use-safe-auth"
import Link from "next/link"
import Image from "next/image"
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background"
import { AnimatedMetalBorder } from "@/components/ui/animated-metal-border"
import {
  Shield,
  Loader2,
  CheckCircle2,
  Terminal,
  Key,
  Activity,
  Eye,
  Wallet,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  RefreshCw,
} from "lucide-react"

type VerifyStatus = "loading" | "active" | "inactive" | "pending" | "failed"

export default function DojoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const { isSignedIn, isLoaded } = useSafeAuth()
  const { user } = useSafeUser()

  const [status, setStatus] = useState<VerifyStatus>("loading")
  const [tier, setTier] = useState<string | null>(null)
  const [pollCount, setPollCount] = useState(0)

  const verify = useCallback(async () => {
    try {
      const res = await fetch("/api/verify-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId || undefined }),
      })
      const data = await res.json()
      setStatus(data.status as VerifyStatus)
      if (data.tier) setTier(data.tier)
    } catch {
      setStatus("failed")
    }
  }, [sessionId])

  // Verify subscription on mount
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    verify()
  }, [isLoaded, isSignedIn, verify])

  // Poll for post-payment verification (webhook may be delayed)
  useEffect(() => {
    if (!sessionId || status === "active" || pollCount >= 3) return

    const timer = setTimeout(() => {
      verify()
      setPollCount((c) => c + 1)
    }, 2000)

    return () => clearTimeout(timer)
  }, [sessionId, status, pollCount, verify])

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/optx-login")
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
        <DottedGlowBackground
          className="pointer-events-none z-[1]"
          opacity={0.6}
          gap={14}
          radius={1.5}
          color="rgba(181, 82, 0, 0.4)"
          glowColor="rgba(181, 82, 0, 0.9)"
          darkColor="rgba(181, 82, 0, 0.4)"
          darkGlowColor="rgba(181, 82, 0, 0.9)"
          backgroundOpacity={0}
        />
        <div className="text-center z-10">
          <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto mb-4" />
          <p className="font-mono text-sm text-white/60">Loading...</p>
        </div>
      </div>
    )
  }

  // Loading / Verifying state
  if (status === "loading" || (status === "pending" && sessionId)) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
        <DottedGlowBackground
          className="pointer-events-none z-[1]"
          opacity={0.6}
          gap={14}
          radius={1.5}
          color="rgba(181, 82, 0, 0.4)"
          glowColor="rgba(181, 82, 0, 0.9)"
          darkColor="rgba(181, 82, 0, 0.4)"
          darkGlowColor="rgba(181, 82, 0, 0.9)"
          backgroundOpacity={0}
        />
        <div className="text-center z-10">
          <div className="w-20 h-20 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="h-10 w-10 animate-spin text-accent" />
          </div>
          <h2 className="font-mono text-lg text-white mb-2" style={{ fontFamily: "var(--font-orbitron), sans-serif" }}>
            Verifying Subscription
          </h2>
          <p className="font-mono text-xs text-zinc-500">
            Confirming payment with Stripe...
          </p>
        </div>
      </div>
    )
  }

  // Not subscribed - redirect to pricing
  if (status === "inactive" || status === "failed") {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
        <DottedGlowBackground
          className="pointer-events-none z-[1]"
          opacity={0.6}
          gap={14}
          radius={1.5}
          color="rgba(181, 82, 0, 0.4)"
          glowColor="rgba(181, 82, 0, 0.9)"
          darkColor="rgba(181, 82, 0, 0.4)"
          darkGlowColor="rgba(181, 82, 0, 0.9)"
          backgroundOpacity={0}
        />
        <div className="relative z-10 text-center max-w-md px-4">
          <AnimatedMetalBorder containerClassName="rounded-xl w-full" borderWidth={2} borderRadius={12}>
            <div className="bg-zinc-900/90 p-8 rounded-xl">
              {status === "failed" ? (
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              ) : (
                <Shield className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
              )}
              <h2
                className="font-mono text-xl text-white mb-2"
                style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
              >
                {status === "failed" ? "Verification Failed" : "Subscription Required"}
              </h2>
              <p className="font-mono text-xs text-zinc-500 mb-6">
                {status === "failed"
                  ? "There was an issue verifying your payment. Please try again or contact support."
                  : "Subscribe to access the DOJO developer dashboard and build on the JOE spatial network."}
              </p>
              <div className="flex gap-3 justify-center">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent hover:bg-accent/90 text-white font-mono text-sm transition-colors"
                >
                  View Plans
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {status === "failed" && (
                  <button
                    onClick={() => { setStatus("loading"); verify() }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-sm transition-colors border border-zinc-700"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                  </button>
                )}
              </div>
            </div>
          </AnimatedMetalBorder>
        </div>
      </div>
    )
  }

  // ACTIVE - Show DOJO Developer Dashboard
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col overflow-auto">
      <DottedGlowBackground
        className="pointer-events-none z-[1]"
        opacity={0.4}
        gap={14}
        radius={1.5}
        color="rgba(181, 82, 0, 0.3)"
        glowColor="rgba(181, 82, 0, 0.7)"
        darkColor="rgba(181, 82, 0, 0.3)"
        darkGlowColor="rgba(181, 82, 0, 0.7)"
        backgroundOpacity={0}
      />

      {/* Header */}
      <header className="relative z-20 flex justify-between items-center p-6 border-b border-zinc-800/50">
        <Link href="/" className="group flex items-center gap-2">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <span className="relative flex h-full w-full">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <Image
                src="/images/astroknots-logo.png"
                alt="OPTX Logo"
                width={32}
                height={32}
                className="relative inline-flex rounded-full object-contain"
              />
            </span>
          </div>
          <span className="font-mono text-xs tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
            OPTX
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="px-2 py-1 rounded-md font-mono text-[10px] bg-green-500/20 text-green-400 border border-green-500/30">
            {tier ? tier.toUpperCase() : "ACTIVE"}
          </span>
          {user && (
            <span className="font-mono text-xs text-zinc-500">
              {user.primaryEmailAddress?.emailAddress?.split("@")[0]}
            </span>
          )}
          <Link
            href="/security"
            className="px-3 py-1.5 rounded-lg font-mono text-xs bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors border border-zinc-700"
          >
            Account
          </Link>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="relative z-10 flex-1 p-6 max-w-6xl mx-auto w-full">
        {/* Welcome Banner */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
            <h1
              className="font-mono text-2xl md:text-3xl tracking-widest text-white uppercase"
              style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
            >
              DOJO
            </h1>
          </div>
          <p className="font-mono text-xs text-zinc-500">
            Developer dashboard for the JOE spatial network. Build gaze-authenticated apps on DePIN infrastructure.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* API Keys */}
          <AnimatedMetalBorder containerClassName="rounded-xl" borderWidth={1} borderRadius={12}>
            <div className="bg-zinc-900/80 p-6 rounded-xl h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Key className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-mono text-sm text-white">API Keys</h3>
                  <p className="font-mono text-[10px] text-zinc-500">Spatial encryption keys</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded bg-zinc-800/50 border border-zinc-700/50">
                  <span className="font-mono text-[10px] text-zinc-400">Production</span>
                  <span className="font-mono text-[10px] text-zinc-600">optx_live_****</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-zinc-800/50 border border-zinc-700/50">
                  <span className="font-mono text-[10px] text-zinc-400">Devnet</span>
                  <span className="font-mono text-[10px] text-zinc-600">optx_test_****</span>
                </div>
              </div>
              <button className="mt-4 w-full px-3 py-2 rounded-lg font-mono text-xs bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors border border-zinc-700">
                Generate New Key
              </button>
            </div>
          </AnimatedMetalBorder>

          {/* Gaze Training */}
          <AnimatedMetalBorder containerClassName="rounded-xl" borderWidth={1} borderRadius={12}>
            <div className="bg-zinc-900/80 p-6 rounded-xl h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-mono text-sm text-white">Gaze Training</h3>
                  <p className="font-mono text-[10px] text-zinc-500">Train your gaze model</p>
                </div>
              </div>
              <p className="font-mono text-[10px] text-zinc-400 mb-4">
                Calibrate gaze biometrics for on-chain attestation. Required for DePIN node validation.
              </p>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-1.5 rounded-full bg-zinc-800">
                  <div className="h-full w-0 rounded-full bg-green-500 transition-all" />
                </div>
                <span className="font-mono text-[10px] text-zinc-500">0%</span>
              </div>
              <a href="/dojo/training" className="block w-full px-3 py-2 rounded-lg font-mono text-xs bg-green-600 hover:bg-green-500 text-white transition-colors text-center">
                Start Training
              </a>
            </div>
          </AnimatedMetalBorder>

          {/* JOE Agent */}
          <AnimatedMetalBorder containerClassName="rounded-xl" borderWidth={1} borderRadius={12}>
            <div className="bg-zinc-900/80 p-6 rounded-xl h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-mono text-sm text-white">JOE Agent</h3>
                  <p className="font-mono text-[10px] text-zinc-500">AI assistant SDK</p>
                </div>
              </div>
              <p className="font-mono text-[10px] text-zinc-400 mb-4">
                Build with the JOE Agent SDK. Custom prompts, spatial context, and gaze-aware responses.
              </p>
              <div className="p-2 rounded bg-zinc-800/50 border border-zinc-700/50 mb-4">
                <code className="font-mono text-[10px] text-accent">npm install @jettoptics/joe-sdk</code>
              </div>
              <a
                href="https://docs.jettoptics.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                View Docs <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </AnimatedMetalBorder>

          {/* DePIN Node */}
          <AnimatedMetalBorder containerClassName="rounded-xl" borderWidth={1} borderRadius={12}>
            <div className="bg-zinc-900/80 p-6 rounded-xl h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-mono text-sm text-white">DePIN Node</h3>
                  <p className="font-mono text-[10px] text-zinc-500">Network participation</p>
                </div>
              </div>
              <p className="font-mono text-[10px] text-zinc-400 mb-4">
                Run a gaze validation node on the JOE network. Earn $OPTX rewards for processing attestations.
              </p>
              <div className="flex items-center gap-2 text-yellow-400/80">
                <span className="px-2 py-1 rounded-md font-mono text-[10px] bg-yellow-500/10 border border-yellow-500/20">
                  DEVNET
                </span>
                <span className="font-mono text-[10px]">Coming Q3 2026</span>
              </div>
            </div>
          </AnimatedMetalBorder>

          {/* Wallet */}
          <AnimatedMetalBorder containerClassName="rounded-xl" borderWidth={1} borderRadius={12}>
            <div className="bg-zinc-900/80 p-6 rounded-xl h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-mono text-sm text-white">Wallet</h3>
                  <p className="font-mono text-[10px] text-zinc-500">Solana + $OPTX</p>
                </div>
              </div>
              <p className="font-mono text-[10px] text-zinc-400 mb-4">
                Connect your Phantom or OKX wallet. Stake $OPTX tokens for enhanced DePIN rewards.
              </p>
              <button className="w-full px-3 py-2 rounded-lg font-mono text-xs bg-orange-600 hover:bg-orange-500 text-white transition-colors">
                Connect Wallet
              </button>
            </div>
          </AnimatedMetalBorder>

          {/* Analytics */}
          <AnimatedMetalBorder containerClassName="rounded-xl" borderWidth={1} borderRadius={12}>
            <div className="bg-zinc-900/80 p-6 rounded-xl h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-mono text-sm text-white">Analytics</h3>
                  <p className="font-mono text-[10px] text-zinc-500">Usage + gaze metrics</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-mono text-[10px] text-zinc-500">API Calls</span>
                  <span className="font-mono text-[10px] text-white">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-[10px] text-zinc-500">Gaze Events</span>
                  <span className="font-mono text-[10px] text-white">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-[10px] text-zinc-500">Attestations</span>
                  <span className="font-mono text-[10px] text-white">0</span>
                </div>
              </div>
            </div>
          </AnimatedMetalBorder>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="font-mono text-[10px] text-zinc-600">
            Program: 91SqqYLMi5zNsfMab6rnvipwJhDpN4FEMSLgu8F3bbGq
          </p>
          <p className="font-mono text-[10px] text-zinc-600">
            $OPTX Mint: 4r9WoPsRjJzrYEuj6VdwowVrFZaXpu16Qt6xogcmdUXC
          </p>
        </div>
      </main>

      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none z-[6]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
