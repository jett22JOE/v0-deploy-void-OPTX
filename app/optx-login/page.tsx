"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SignIn, SignUp } from "@clerk/nextjs"
import { useSafeAuth } from "@/lib/hooks/use-safe-auth"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import nextDynamic from "next/dynamic"
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background"
import { AnimatedMetalBorder } from "@/components/ui/animated-metal-border"
import { useWallet } from "@solana/wallet-adapter-react"

// Dynamic import for wallet button (SSR-safe)
const WalletMultiButton = nextDynamic(
  () => import("@solana/wallet-adapter-react-ui").then((mod) => mod.WalletMultiButton),
  { ssr: false, loading: () => <div className="h-10 w-40 bg-zinc-800 rounded-lg animate-pulse" /> }
)

// JETT Auth explanatory modal — average Joe friendly
function JettAuthModal({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[300] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-orange-500/60 p-6 md:p-8 rounded-2xl max-w-md w-full text-center"
      >
        <div className="mb-4">
          <Image
            src="/images/astroknots-logo.png"
            alt="JETT Auth"
            width={48}
            height={48}
            className="mx-auto rounded-full"
          />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-orbitron), sans-serif" }}>
          Welcome to JETT Auth — Your First Knot
        </h2>

        <div className="space-y-3 text-left text-zinc-300 text-sm leading-relaxed">
          <p><span className="text-orange-400 font-bold">1.</span> Choose a 4–6 digit pin (knot wrappings) — this is your biometric password.</p>
          <p><span className="text-orange-400 font-bold">2.</span> This pin links permanently to your wallet signature (read-only, no funds moved).</p>
          <p><span className="text-orange-400 font-bold">3.</span> We mint your personal agentic neuromorphic model — your &quot;Average Joe Twin&quot; that lets you pick a username.</p>
          <p><span className="text-orange-400 font-bold">4.</span> Genesis signature = seed phrase (changeable later on OPTX network). Costs 1 JTX staked for Seed Vault later.</p>
          <p><span className="text-orange-400 font-bold">5.</span> Camera must stay on (real eyes only) — use <kbd className="px-1 rounded bg-zinc-800 text-orange-300 border border-zinc-700">1</kbd> <kbd className="px-1 rounded bg-zinc-800 text-orange-300 border border-zinc-700">2</kbd> <kbd className="px-1 rounded bg-zinc-800 text-orange-300 border border-zinc-700">3</kbd> keys to match DOJO. Agent on/off toggle below.</p>
          <p><span className="text-orange-400 font-bold">6.</span> All linked to your Clerk account + Convex DB you just set up.</p>
        </div>

        <button
          onClick={onDismiss}
          className="mt-8 w-full bg-orange-500 hover:bg-orange-600 px-8 py-3 rounded-xl text-white font-medium font-mono tracking-wide transition-colors"
        >
          I Understand — Start Gaze Pattern
        </button>
      </motion.div>
    </div>
  )
}

export default function OptxLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isSignedIn, isLoaded } = useSafeAuth()
  const { publicKey, connected } = useWallet()

  // JETT Auth modal state
  const [showJettModal, setShowJettModal] = useState(true)

  // Check if we should show signup tab by default
  const defaultTab = searchParams.get("tab") || "signin"
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(
    defaultTab === "signup" ? "signup" : "signin"
  )

  // Timeout fallback — if Clerk never loads after 8s, show the form anyway
  const [forceShow, setForceShow] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoaded) setForceShow(true)
    }, 8000)
    return () => clearTimeout(timer)
  }, [isLoaded])

  // Redirect to DOJO if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dojo")
    }
  }, [isLoaded, isSignedIn, router])

  // Show loading state while Clerk initializes (with timeout escape)
  if ((!isLoaded && !forceShow) || isSignedIn) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
        <DottedGlowBackground
          className="pointer-events-none z-[1]"
          opacity={0.8}
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
          <p className="font-mono text-sm text-white/60">
            {isSignedIn ? "Redirecting to DOJO..." : "Loading..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-y-auto">
      <DottedGlowBackground
        className="pointer-events-none z-[1]"
        opacity={0.8}
        gap={14}
        radius={1.5}
        color="rgba(181, 82, 0, 0.4)"
        glowColor="rgba(181, 82, 0, 0.9)"
        darkColor="rgba(181, 82, 0, 0.4)"
        darkGlowColor="rgba(181, 82, 0, 0.9)"
        backgroundOpacity={0}
      />

      {/* JETT Auth modal */}
      {showJettModal && <JettAuthModal onDismiss={() => setShowJettModal(false)} />}

      {/* Logo and back link */}
      <Link href="/" className="absolute top-6 left-6 z-20 group flex items-center gap-2">
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

      {/* Wallet connect + status — top right */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <div className={`px-3 py-1 rounded-full font-mono text-[10px] ${
          connected
            ? "bg-green-500/20 text-green-400 border border-green-500/30"
            : "bg-zinc-800/80 text-zinc-500 border border-zinc-700"
        }`}>
          {publicKey ? `${publicKey.toBase58().slice(0, 6)}...${publicKey.toBase58().slice(-4)}` : "No Wallet"}
        </div>
        <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-orange-500 !text-white !font-mono !text-xs !px-4 !py-2 !rounded-lg !border-0 !h-auto hover:!from-purple-700 hover:!to-orange-600" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="relative z-[200] flex flex-col items-center justify-center p-4 w-full max-w-md"
        >
          {/* Tab switcher */}
          <div className="flex mb-4 bg-zinc-900/80 rounded-lg p-1 border border-zinc-800">
            <button
              onClick={() => setActiveTab("signin")}
              className={`px-6 py-2 rounded-md font-mono text-xs tracking-wider transition-all duration-200 ${
                activeTab === "signin"
                  ? "bg-accent text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              SIGN IN
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`px-6 py-2 rounded-md font-mono text-xs tracking-wider transition-all duration-200 ${
                activeTab === "signup"
                  ? "bg-accent text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              SIGN UP
            </button>
          </div>

          <AnimatedMetalBorder
            containerClassName="rounded-2xl w-full"
            borderWidth={4}
            borderRadius={16}
          >
            <div className="clerk-auth-wrapper rounded-2xl w-full">
              {/* CSS overrides for Clerk components */}
              <style jsx global>{`
                .clerk-auth-wrapper .cl-rootBox,
                .clerk-auth-wrapper .cl-card,
                .clerk-auth-wrapper .cl-headerTitle,
                .clerk-auth-wrapper .cl-headerSubtitle,
                .clerk-auth-wrapper .cl-formFieldLabel,
                .clerk-auth-wrapper .cl-formFieldInput,
                .clerk-auth-wrapper .cl-formButtonPrimary,
                .clerk-auth-wrapper .cl-footerActionText,
                .clerk-auth-wrapper .cl-footerActionLink,
                .clerk-auth-wrapper * {
                  font-family: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace !important;
                }
                .clerk-auth-wrapper {
                  max-height: 80vh;
                  overflow-y: auto;
                  scrollbar-width: thin;
                  scrollbar-color: rgba(181, 82, 0, 0.5) transparent;
                }
                .clerk-auth-wrapper::-webkit-scrollbar { width: 6px; }
                .clerk-auth-wrapper::-webkit-scrollbar-track { background: transparent; }
                .clerk-auth-wrapper::-webkit-scrollbar-thumb { background: rgba(181, 82, 0, 0.5); border-radius: 3px; }
                .clerk-auth-wrapper .cl-card { padding-top: 1.5rem !important; }
                .clerk-auth-wrapper .cl-footer { display: none !important; }
                @media (max-width: 640px) {
                  .clerk-auth-wrapper { max-height: 75vh; width: 100%; }
                  .clerk-auth-wrapper .cl-formFieldInput, .clerk-auth-wrapper input { font-size: 16px !important; }
                }
              `}</style>

              {activeTab === "signin" ? (
                <SignIn
                  forceRedirectUrl="/gaze-verify"
                  signUpUrl="/optx-login?tab=signup"
                  appearance={{
                    variables: {
                      colorPrimary: "#b55200",
                      colorText: "#ffffff",
                      colorTextSecondary: "#a1a1aa",
                      colorBackground: "#2d2b55",
                      colorInputBackground: "#18181b",
                      colorInputText: "#ffffff",
                      borderRadius: "0.5rem",
                    },
                    elements: {
                      rootBox: "w-full",
                      card: "bg-[#2d2b55]/95 shadow-none border-0 backdrop-blur-xl",
                      headerTitle: "font-mono text-white",
                      headerSubtitle: "font-mono text-sm text-zinc-400",
                      formFieldLabel: "font-mono text-xs text-zinc-400",
                      formFieldInput: "font-mono text-sm bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500",
                      formButtonPrimary: "font-mono bg-accent hover:bg-accent/90 text-white",
                      footerActionLink: "text-accent hover:text-accent/80",
                      socialButtonsBlockButton: "font-mono border-zinc-800 hover:bg-zinc-900/50 text-white",
                      socialButtonsBlockButtonText: "font-mono text-sm",
                      dividerLine: "bg-zinc-800",
                      dividerText: "font-mono text-xs text-zinc-500",
                      identityPreviewText: "font-mono text-white",
                      identityPreviewEditButton: "text-accent",
                      formFieldSuccessText: "text-green-400",
                      formFieldErrorText: "text-red-400",
                      alertText: "font-mono text-sm",
                      otpCodeFieldInput: "font-mono bg-zinc-900/50 border-zinc-800 text-white",
                    }
                  }}
                />
              ) : (
                <SignUp
                  forceRedirectUrl="/gaze-verify"
                  signInUrl="/optx-login?tab=signin"
                  appearance={{
                    variables: {
                      colorPrimary: "#b55200",
                      colorText: "#ffffff",
                      colorTextSecondary: "#a1a1aa",
                      colorBackground: "#2d2b55",
                      colorInputBackground: "#18181b",
                      colorInputText: "#ffffff",
                      borderRadius: "0.5rem",
                    },
                    elements: {
                      rootBox: "w-full",
                      card: "bg-[#2d2b55]/95 shadow-none border-0 backdrop-blur-xl",
                      headerTitle: "font-mono text-white",
                      headerSubtitle: "font-mono text-sm text-zinc-400",
                      formFieldLabel: "font-mono text-xs text-zinc-400",
                      formFieldInput: "font-mono text-sm bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500",
                      formButtonPrimary: "font-mono bg-accent hover:bg-accent/90 text-white",
                      footerActionLink: "text-accent hover:text-accent/80",
                      socialButtonsBlockButton: "font-mono border-zinc-800 hover:bg-zinc-900/50 text-white",
                      socialButtonsBlockButtonText: "font-mono text-sm",
                      dividerLine: "bg-zinc-800",
                      dividerText: "font-mono text-xs text-zinc-500",
                      identityPreviewText: "font-mono text-white",
                      identityPreviewEditButton: "text-accent",
                      formFieldSuccessText: "text-green-400",
                      formFieldErrorText: "text-red-400",
                      alertText: "font-mono text-sm",
                      otpCodeFieldInput: "font-mono bg-zinc-900/50 border-zinc-800 text-white",
                    }
                  }}
                />
              )}
            </div>
          </AnimatedMetalBorder>

          {/* Gaze verify link — after Clerk auth, go to gaze pattern */}
          <div className="mt-4 text-center">
            <Link
              href="/gaze-verify"
              className="font-mono text-xs text-orange-400/60 hover:text-orange-400 transition-colors underline underline-offset-4"
            >
              Skip to Gaze Verification →
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-[6]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
