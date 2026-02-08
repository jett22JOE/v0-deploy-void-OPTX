"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SignIn, SignUp } from "@clerk/nextjs"
import { useSafeAuth } from "@/lib/hooks/use-safe-auth"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background"
import { AnimatedMetalBorder } from "@/components/ui/animated-metal-border"

export default function OptxLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isSignedIn, isLoaded } = useSafeAuth()

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

  // Redirect to /dev if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dev")
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
          speedMin={0.2}
          speedMax={0.8}
          speedScale={0.8}
        />
        <div className="text-center z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto mb-4" />
          <p className="font-mono text-sm text-white/60">
            {isSignedIn ? "Redirecting to Dev Access..." : "Loading..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">
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
        speedMin={0.2}
        speedMax={0.8}
        speedScale={0.8}
      />

      {/* Logo and back link */}
      <Link href="/" className="absolute top-6 left-6 z-20 group flex items-center gap-2">
        <div className="relative w-8 h-8 md:w-6 md:h-6 flex items-center justify-center">
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

      {/* Page title */}
      <h1
        className="absolute top-6 right-6 z-20 font-mono text-xs md:text-sm tracking-widest text-white uppercase animate-pulse-glow"
        style={{
          fontFamily: "var(--font-orbitron), sans-serif",
        }}
      >
        {activeTab === "signin" ? "Sign In" : "Sign Up"}
      </h1>

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
                  font-family: "Geist Mono", "Geist Mono Fallback", ui-monospace, SFMono-Regular,
                    "SF Mono", Menlo, Consolas, "Liberation Mono", monospace !important;
                }
                .clerk-auth-wrapper .cl-headerTitle {
                  letter-spacing: 0.05em !important;
                }
                .clerk-auth-wrapper .cl-headerSubtitle {
                  letter-spacing: 0.02em !important;
                }
                .clerk-auth-wrapper .cl-formFieldInput,
                .clerk-auth-wrapper input {
                  font-size: 13px !important;
                  text-transform: none !important;
                }
                .clerk-auth-wrapper {
                  max-height: 85vh;
                  overflow-y: auto;
                  scrollbar-width: thin;
                  scrollbar-color: rgba(181, 82, 0, 0.5) transparent;
                }
                .clerk-auth-wrapper::-webkit-scrollbar {
                  width: 6px;
                }
                .clerk-auth-wrapper::-webkit-scrollbar-track {
                  background: transparent;
                }
                .clerk-auth-wrapper::-webkit-scrollbar-thumb {
                  background: rgba(181, 82, 0, 0.5);
                  border-radius: 3px;
                }
                .clerk-auth-wrapper .cl-card {
                  padding-top: 1.5rem !important;
                }
                /* Hide Clerk's built-in footer links since we have tabs */
                .clerk-auth-wrapper .cl-footer {
                  display: none !important;
                }

                /* Mobile responsive styles */
                @media (max-width: 640px) {
                  .clerk-auth-wrapper {
                    max-height: 80vh;
                    width: 100%;
                  }
                  .clerk-auth-wrapper .cl-headerTitle {
                    font-size: 1.25rem !important;
                  }
                  .clerk-auth-wrapper .cl-headerSubtitle {
                    font-size: 0.75rem !important;
                  }
                  .clerk-auth-wrapper .cl-formFieldLabel {
                    font-size: 0.7rem !important;
                  }
                  .clerk-auth-wrapper .cl-formFieldInput,
                  .clerk-auth-wrapper input {
                    font-size: 16px !important; /* Prevents iOS zoom */
                    padding: 0.5rem !important;
                  }
                  .clerk-auth-wrapper .cl-formButtonPrimary {
                    font-size: 0.8rem !important;
                    padding: 0.6rem !important;
                  }
                  .clerk-auth-wrapper .cl-socialButtonsBlockButton {
                    padding: 0.5rem !important;
                  }
                  .clerk-auth-wrapper .cl-socialButtonsBlockButtonText {
                    font-size: 0.75rem !important;
                  }
                  .clerk-auth-wrapper .cl-card {
                    padding: 1rem !important;
                  }
                  .clerk-auth-wrapper .cl-rootBox {
                    max-width: 100% !important;
                    width: 100% !important;
                  }
                }
              `}</style>

              {activeTab === "signin" ? (
                <SignIn
                  forceRedirectUrl="/dev"
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
                  forceRedirectUrl="/dev"
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
