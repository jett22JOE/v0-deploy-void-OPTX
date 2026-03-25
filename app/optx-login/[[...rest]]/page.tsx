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
import { StarfieldBackground } from "@/components/ui/starfield-background"
import { useWallet } from "@solana/wallet-adapter-react"
import { Wallet, ExternalLink, CheckCircle2 } from "lucide-react"
import { JettAuthModal } from "@/components/jett-auth-modal"

// Dynamic import for wallet button (SSR-safe)
const WalletMultiButton = nextDynamic(
  () => import("@solana/wallet-adapter-react-ui").then((mod) => mod.WalletMultiButton),
  { ssr: false, loading: () => <div className="h-10 w-full bg-zinc-800 rounded-lg animate-pulse" /> }
)

export default function OptxLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isSignedIn, isLoaded } = useSafeAuth()
  const { publicKey, connected } = useWallet()

  // JETT Auth modal state
  const [showJettModal, setShowJettModal] = useState(true)

  // Mobile detection (for Phantom deep-link vs WalletMultiButton)
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
  }, [])

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

  // Admin wallets — redirect to vault/dojo on wallet-only connect
  const ADMIN_WALLETS = [
    "FEUwuvXbbSYTCEhhqgAt2viTsEnromNNDsapoFvyfy3H", // founder wallet
    "EFvgELE1Hb4PC5tbPTAe8v1uEDGee8nwYBMCU42bZRGk", // jettoptx.skr / JOE agent wallet
  ]

  // Redirect to DOJO if already signed in (Clerk)
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dojo")
    }
  }, [isLoaded, isSignedIn, router])

  // Redirect wallet-connected users to gaze verification (JETT Auth flow)
  useEffect(() => {
    if (connected && publicKey && !isSignedIn) {
      const walletAddr = publicKey.toBase58()
      if (ADMIN_WALLETS.includes(walletAddr)) {
        router.push("/gaze-verify")
      } else {
        router.push("/gaze-verify")
      }
    }
  }, [connected, publicKey, isSignedIn, router])

  // Build Phantom deep-link URL (client-side only)
  const phantomDeepLink = typeof window !== "undefined"
    ? `https://phantom.app/ul/browse/${encodeURIComponent(window.location.href)}`
    : "#"

  // Show loading state while Clerk initializes (with timeout escape)
  if ((!isLoaded && !forceShow) || isSignedIn) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
        <StarfieldBackground alwaysDark />
        <div className="text-center z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto mb-4" />
          <p className="font-mono text-sm text-white/60">
            {isSignedIn ? "Redirecting to DOJO..." : "Loading..."}
          </p>
        </div>
      </div>
    )
  }

  // Shared Clerk appearance config
  const clerkAppearance = {
    variables: {
      colorPrimary: "#b55200",
      colorText: "#1a1a1a",
      colorTextSecondary: "#555555",
      colorBackground: "#ffffff",
      colorInputBackground: "#f4f4f5",
      colorInputText: "#1a1a1a",
      borderRadius: "0.5rem",
    },
    elements: {
      rootBox: "w-full",
      card: "bg-white shadow-none border-0 backdrop-blur-xl",
      headerTitle: "font-mono text-zinc-900",
      headerSubtitle: "font-mono text-sm text-zinc-500",
      formFieldLabel: "font-mono text-xs text-zinc-600",
      formFieldInput: "font-mono text-sm bg-zinc-100 border-zinc-300 text-zinc-900 placeholder:text-zinc-400",
      formButtonPrimary: "font-mono bg-accent hover:bg-accent/90 text-white",
      footerActionLink: "text-accent hover:text-accent/80",
      socialButtonsBlockButton: "font-mono border-zinc-300 hover:bg-zinc-100 text-zinc-900",
      socialButtonsBlockButtonText: "font-mono text-sm text-zinc-900",
      dividerLine: "bg-zinc-300",
      dividerText: "font-mono text-xs text-zinc-500",
      identityPreviewText: "font-mono text-zinc-900",
      identityPreviewEditButton: "text-accent",
      formFieldSuccessText: "text-green-600",
      formFieldErrorText: "text-red-500",
      alertText: "font-mono text-sm",
      otpCodeFieldInput: "font-mono bg-zinc-100 border-zinc-300 text-zinc-900",
    },
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col overflow-y-auto">
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

      {/* Header bar — logo + wallet status badge only */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 bg-black">
        <Link href="/" className="group flex items-center gap-2 shrink-0">
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center">
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

        {/* Wallet status badge — no button, just status */}
        <div className={`px-2.5 py-1 rounded-full font-mono text-[10px] ${
          connected
            ? "bg-green-500/20 text-green-400 border border-green-500/30"
            : "bg-zinc-800/80 text-zinc-500 border border-zinc-700"
        }`}>
          {publicKey ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : "No Wallet"}
        </div>
      </div>

      {/* Main content — centered with proper mobile padding */}
      <div className="flex-1 flex flex-col items-center justify-start sm:justify-center px-4 pt-4 pb-8 sm:pt-0 sm:pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative z-[200] flex flex-col items-center w-full max-w-md"
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

            {/* Clerk auth card */}
            <div className="rounded-2xl w-full border border-zinc-300/20 bg-white/5 backdrop-blur-sm shadow-xl shadow-black/30 overflow-hidden">
              <div className="clerk-auth-wrapper rounded-2xl w-full">
                {/* CSS overrides for Clerk components — force white card */}
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
                    max-height: none;
                    overflow-y: visible;
                  }
                  .clerk-auth-wrapper .cl-card {
                    padding-top: 1.5rem !important;
                    background-color: #ffffff !important;
                    background: #ffffff !important;
                  }
                  .clerk-auth-wrapper .cl-cardBox {
                    background-color: #ffffff !important;
                    background: #ffffff !important;
                  }
                  .clerk-auth-wrapper .cl-rootBox {
                    background-color: transparent !important;
                  }
                  .clerk-auth-wrapper .cl-card *:not(input):not(button):not(a) {
                    color: inherit;
                  }
                  .clerk-auth-wrapper .cl-footer { display: none !important; }
                  .clerk-auth-wrapper .cl-internal-b3fm6y {
                    background-color: #ffffff !important;
                  }
                  /* Force Solana social button to show text label */
                  .clerk-auth-wrapper .cl-socialButtonsBlockButton,
                  .clerk-auth-wrapper .cl-socialButtonsIconButton {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: 0.5rem !important;
                    width: 100% !important;
                    padding: 0.625rem 1rem !important;
                    border: 1px solid #d4d4d8 !important;
                    border-radius: 0.5rem !important;
                    background-color: #ffffff !important;
                    color: #1a1a1a !important;
                    font-size: 0.875rem !important;
                    min-height: 2.75rem !important;
                  }
                  .clerk-auth-wrapper .cl-socialButtonsBlockButton:hover,
                  .clerk-auth-wrapper .cl-socialButtonsIconButton:hover {
                    background-color: #f4f4f5 !important;
                  }
                  .clerk-auth-wrapper .cl-socialButtonsBlockButtonText,
                  .clerk-auth-wrapper .cl-socialButtonsBlockButtonText__solana {
                    color: #1a1a1a !important;
                    font-size: 0.875rem !important;
                    display: inline !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                  }
                  .clerk-auth-wrapper .cl-socialButtonsProviderIcon {
                    width: 1.25rem !important;
                    height: 1.25rem !important;
                  }
                  @media (max-width: 640px) {
                    .clerk-auth-wrapper .cl-formFieldInput,
                    .clerk-auth-wrapper input {
                      font-size: 16px !important;
                    }
                  }
                `}</style>

                {activeTab === "signin" ? (
                  <SignIn
                    forceRedirectUrl="/gaze-verify"
                    signUpUrl="/optx-login?tab=signup"
                    appearance={clerkAppearance}
                  />
                ) : (
                  <SignUp
                    forceRedirectUrl="/gaze-verify"
                    signInUrl="/optx-login?tab=signin"
                    appearance={clerkAppearance}
                  />
                )}
              </div>
            </div>

            {/* ─── OR CONNECT WALLET ─── section */}
            <div className="w-full mt-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
                <span className="font-mono text-[10px] tracking-widest text-orange-400/60 uppercase">
                  or connect wallet
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
              </div>

              {connected && publicKey ? (
                // Connected state
                <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="font-mono text-sm text-green-400">
                    {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                  </span>
                </div>
              ) : isMobile ? (
                // Mobile: Phantom deep-link button
                <a
                  href={phantomDeepLink}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-[#b55200] hover:bg-[#8a3f00] text-white font-mono text-sm border border-orange-500/30 transition-colors"
                >
                  <Wallet className="w-4 h-4" />
                  Open in Phantom App
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </a>
              ) : (
                // Desktop: WalletMultiButton
                <div className="wallet-connect-section flex justify-center">
                  <style jsx global>{`
                    .wallet-connect-section .wallet-adapter-button {
                      width: 100% !important;
                      justify-content: center !important;
                      background-color: #b55200 !important;
                      border: 1px solid rgba(249, 115, 22, 0.3) !important;
                      border-radius: 0.75rem !important;
                      font-family: "Geist Mono", ui-monospace, monospace !important;
                      font-size: 0.875rem !important;
                      padding: 0.75rem 1rem !important;
                      height: auto !important;
                      transition: background-color 0.2s !important;
                    }
                    .wallet-connect-section .wallet-adapter-button:hover {
                      background-color: #8a3f00 !important;
                    }
                  `}</style>
                  <WalletMultiButton className="!w-full" />
                </div>
              )}
            </div>

            {/* Gaze verify link — after Clerk auth, go to gaze pattern */}
            <div className="mt-5 text-center">
              <Link
                href="/gaze-verify"
                className="font-mono text-xs text-orange-400/60 hover:text-orange-400 transition-colors underline underline-offset-4"
              >
                Skip to Gaze Verification →
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Noise overlay */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-[6]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
