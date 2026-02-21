"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSafeAuth, useSafeUser } from "@/lib/hooks/use-safe-auth"
import Link from "next/link"
import Image from "next/image"
import nextDynamic from "next/dynamic"
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background"
// AnimatedMetalBorder removed for hydration performance
import { PolynomialGazePinInput } from "@/components/gaze/PolynomialGazePinInput"
import { AGTCircle } from "@/components/gaze/AGTCircle"
import {
  JOULETemplate,
  GazeTensor,
  GazeVerificationResponse,
} from "@/lib/joule/types"
import { useWallet } from "@solana/wallet-adapter-react"

// Force dynamic rendering to avoid SSR issues with wallet
export const dynamic = 'force-dynamic'

// Dynamic import for wallet button (SSR-safe)
const WalletMultiButton = nextDynamic(
  () => import("@solana/wallet-adapter-react-ui").then((mod) => mod.WalletMultiButton),
  { ssr: false, loading: () => <div className="h-10 w-32 bg-zinc-800 rounded-lg animate-pulse" /> }
)

// Flow states
type VerificationState =
  | "loading"
  | "setup"
  | "verify"
  | "connecting"
  | "minting"
  | "success"
  | "error"

export default function GazeVerifyPage() {
  const router = useRouter()
  const { isSignedIn, isLoaded: authLoaded } = useSafeAuth()
  const { user } = useSafeUser()

  // Verification state
  const [state, setState] = useState<VerificationState>("loading")
  const [sessionNonce, setSessionNonce] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [verificationResult, setVerificationResult] = useState<GazeVerificationResponse | null>(null)

  // Gaze simulation state
  const [currentGaze, setCurrentGaze] = useState<GazeTensor | null>(null)
  const [isTracking, setIsTracking] = useState(false)

  // Solana wallet hook
  const { publicKey, connected } = useWallet()
  const [jtxBalance, setJtxBalance] = useState<number | null>(null)
  const [hasJtx, setHasJtx] = useState(false)

  // Initialize verification session
  const isLocalDev = typeof window !== "undefined" && window.location.hostname === "localhost"
  useEffect(() => {
    // DEV: Skip Clerk auth check on localhost
    if (!isLocalDev && !authLoaded) return

    if (!isSignedIn && !isLocalDev) {
      router.push("/optx-login")
      return
    }

    const nonce = crypto.randomUUID()
    setSessionNonce(nonce)
    setState("setup")
  }, [authLoaded, isSignedIn, router, isLocalDev])

  // Handle polynomial PIN completion
  const handlePinComplete = useCallback(async (template: JOULETemplate) => {
    setState("connecting")

    try {
      console.log("JOULE Template:", template)
      console.log("Polynomial Encoding:", template.polynomialEncoding)

      await new Promise(resolve => setTimeout(resolve, 1500))

      const mockResponse: GazeVerificationResponse = {
        success: true,
        verified: true,
        edgeApproved: true,
        adminApproved: true,
        verificationId: crypto.randomUUID(),
      }

      setVerificationResult(mockResponse)

      if (connected && publicKey) {
        setState("minting")
        await new Promise(resolve => setTimeout(resolve, 2000))
        mockResponse.mintTransactionSig = "SIMULATED_TX_SIG_" + Date.now()
      }

      setState("success")

      setTimeout(() => {
        router.push("/?joined=true&gaze_verified=true")
      }, 3000)

    } catch (err) {
      console.error("Verification error:", err)
      setError(err instanceof Error ? err.message : "Verification failed")
      setState("error")
    }
  }, [connected, publicKey, router])

  // Loading state
  if (state === "loading" || (!authLoaded && !isLocalDev)) {
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto mb-4" />
          <p className="font-mono text-sm text-white/60">Initializing gaze verification...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-start overflow-y-auto pt-20 pb-12">
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

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-6 z-20">
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

        <div className="flex items-center gap-4">
          {user && (
            <span className="font-mono text-xs text-zinc-500">
              {user.primaryEmailAddress?.emailAddress?.split("@")[0]}
            </span>
          )}

          <div className={`px-3 py-1 rounded-full font-mono text-xs ${
            connected
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-zinc-800 text-zinc-500 border border-zinc-700"
          }`}>
            {publicKey ? `${publicKey.toBase58().slice(0, 8)}...` : "No Wallet"}
            {jtxBalance !== null && ` (JTX: ${jtxBalance.toFixed(2)})`}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 max-w-lg w-full px-4">
        <div className="text-center">
          <h1
            className="font-mono text-2xl md:text-3xl tracking-widest text-white uppercase mb-2"
            style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
          >
            Gaze Verification
          </h1>
          <p className="font-mono text-sm text-orange-400">
            {state === "setup" && "Hold 1 (COG) · 2 (EMO) · 3 (ENV) to create your 4-position gaze pattern"}
            {state === "verify" && "Verify your gaze pattern to continue"}
            {state === "connecting" && "Verifying gaze pattern..."}
            {state === "minting" && "Minting $OPTX tokens..."}
            {state === "success" && "Verification successful!"}
            {state === "error" && "Verification failed"}
          </p>
        </div>

        {/* AGT Circle visualization */}
        <div className="rounded-2xl border border-orange-500/20 bg-black/80 p-6 shadow-xl shadow-black/30">
          <AGTCircle
            gazeSection={currentGaze}
            isTracking={isTracking}
            isHolding={state === "setup" || state === "verify"}
            size="large"
            onSectionSelect={(section) => {
              setCurrentGaze(section)
              setIsTracking(true)
            }}
          />
        </div>

        {/* Polynomial PIN Input */}
        {(state === "setup" || state === "verify") && (
          <div className="rounded-xl w-full border border-orange-500/20 bg-zinc-900/90 p-6 shadow-lg shadow-black/20">
            <PolynomialGazePinInput
              positions={4}
              holdThreshold={800}
              sessionNonce={sessionNonce}
              onComplete={handlePinComplete}
              onPositionChange={(index, tensor) => {
                console.log(`Position ${index + 1}: ${tensor}`)
              }}
              onError={(err) => {
                setError(err)
                setState("error")
              }}
              isVerifying={state === "connecting" || state === "minting"}
              gazePosition={null}
            />
          </div>
        )}

        {/* Status states */}
        {state === "connecting" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent mx-auto mb-4" />
            <p className="font-mono text-sm text-accent">Verifying gaze signature...</p>
          </div>
        )}

        {state === "minting" && (
          <div className="text-center">
            <div className="animate-pulse">
              <span className="text-4xl">💎</span>
            </div>
            <p className="font-mono text-sm text-purple-400 mt-2">Minting $OPTX on Solana...</p>
            <p className="font-mono text-xs text-zinc-500 mt-1">This may take a few seconds</p>
          </div>
        )}

        {state === "success" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-mono text-sm text-green-400">Gaze pattern verified!</p>
            {verificationResult?.mintTransactionSig && (
              <p className="font-mono text-xs text-zinc-500 mt-2">
                TX: {verificationResult.mintTransactionSig.slice(0, 16)}...
              </p>
            )}
            <p className="font-mono text-xs text-zinc-600 mt-4">Redirecting...</p>
          </div>
        )}

        {state === "error" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="font-mono text-sm text-red-400">{error || "Verification failed"}</p>
            <button
              onClick={() => {
                setError(null)
                setState("setup")
                setSessionNonce(crypto.randomUUID())
              }}
              className="mt-4 px-6 py-2 rounded-lg bg-accent hover:bg-accent/90 text-white font-mono text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Solana WalletMultiButton */}
        <div className="flex flex-col items-center gap-2">
          <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-accent !text-white !font-mono !text-sm !px-6 !py-2 !rounded-lg !border-0 hover:!from-purple-700 hover:!to-accent/90" />
          {connected && hasJtx && (
            <span className="font-mono text-xs text-green-400">✅ JTX verified</span>
          )}
          {connected && !hasJtx && (
            <span className="font-mono text-xs text-yellow-400">⚠️ No JTX balance</span>
          )}
        </div>

        {/* Info text */}
        <div className="text-center max-w-sm">
          <p className="font-mono text-xs italic text-zinc-600 leading-relaxed">
            &ldquo;Your gaze pattern creates a unique polynomial key (3⁴ = 81 combinations).
            Combined with JOULE temporal binding, this prevents replay attacks.&rdquo;
            {connected && (
              <span className="block mt-1 text-orange-400/60 not-italic">
                After verification, $OPTX will be minted to your wallet.
              </span>
            )}
          </p>
        </div>
      </div>

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
