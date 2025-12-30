"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { SignUp, UserProfile } from "@clerk/nextjs"
import { useClerk, useAuth, useUser } from "@clerk/nextjs"
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background"
import { AnimatedMetalBorder } from "@/components/ui/animated-metal-border"
import { LogOut, User, X } from "lucide-react"

// Check if Clerk is available on this domain
function useIsClerkEnabled() {
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null)
  useEffect(() => {
    const hostname = window.location.hostname
    const isClerkDomain =
      hostname === "jettoptics.ai" ||
      hostname.endsWith(".jettoptics.ai") ||
      hostname === "localhost" ||
      hostname === "127.0.0.1"
    setIsEnabled(isClerkDomain)
  }, [])
  return isEnabled
}

export default function LoadingPage() {
  const [showButton, setShowButton] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [signUpError, setSignUpError] = useState<string | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isClerkEnabled = useIsClerkEnabled()

  // Verify Clerk is loaded before allowing submission
  const { loaded: clerkLoaded, signOut } = useClerk()
  const { isSignedIn } = useAuth()
  const { user } = useUser()

  // Handle sign out
  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      setShowUserProfile(false)
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setIsSigningOut(false)
    }
  }

  useEffect(() => {
    // Show button after a delay or when video has played
    const timer = setTimeout(() => {
      setShowButton(true)
    }, 3000) // Show after 3 seconds

    return () => clearTimeout(timer)
  }, [])

  // Auto-open UserProfile modal if user is signed in
  useEffect(() => {
    if (isSignedIn && clerkLoaded) {
      setShowUserProfile(true)
      setShowSignUp(false)
    }
  }, [isSignedIn, clerkLoaded])

  // Fix autocapitalize on mobile for email inputs
  useEffect(() => {
    if (showSignUp) {
      const fixAutocapitalize = () => {
        const inputs = document.querySelectorAll(".clerk-signup-wrapper input")
        inputs.forEach((input) => {
          input.setAttribute("autocapitalize", "off")
          input.setAttribute("autocorrect", "off")
          input.setAttribute("spellcheck", "false")
          input.setAttribute("inputmode", "email")
        })
      }

      // Run immediately and after delays (for Clerk's async rendering)
      fixAutocapitalize()
      const timer = setTimeout(fixAutocapitalize, 500)
      const timer2 = setTimeout(fixAutocapitalize, 1000)

      return () => {
        clearTimeout(timer)
        clearTimeout(timer2)
      }
    }
  }, [showSignUp])

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

      <Link href="/" className="absolute top-6 left-6 z-20 group flex items-center gap-2">
        <div className="relative w-8 h-8 md:w-6 md:h-6 flex items-center justify-center">
          <span className="relative flex h-full w-full">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
            <Image
              src="/images/astroknots-logo.png"
              alt="DAPP Logo"
              width={32}
              height={32}
              className="relative inline-flex rounded-full object-contain"
            />
          </span>
        </div>
        <span className="font-mono text-xs tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
          DAPP
        </span>
      </Link>

      <h1
        className="absolute top-6 right-6 z-20 font-mono text-xs md:text-sm tracking-widest text-white uppercase animate-pulse-glow"
        style={{
          fontFamily: "var(--font-orbitron), sans-serif",
        }}
      >
        Loading...
      </h1>

      {/* Get Early Access Button - shows when not signed up and no profile modal */}
      {!showSignUp && !showUserProfile && (
        <div className="absolute top-[20vh] left-1/2 -translate-x-1/2 md:top-[calc(50%_-_320px)] z-20 flex flex-col items-center gap-6">
          <AnimatePresence>
            {showButton && (
              <motion.button
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                onClick={() => {
                  if (isSignedIn) {
                    setShowUserProfile(true)
                  } else {
                    setShowSignUp(true)
                  }
                }}
                className="group relative rounded-full overflow-hidden p-[1px] transition-all duration-300
                  focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-black
                  hover:shadow-[0_0_30px_rgba(181,82,0,0.3)] active:shadow-[0_0_30px_rgba(181,82,0,0.3)]"
              >
                <span
                  className="absolute inset-[-1000%]"
                  style={{
                    animation: "spin 3s linear infinite",
                    background:
                      "conic-gradient(from 90deg at 50% 50%, #b55200 0%, #ff8c00 25%, #b55200 50%, #ff8c00 75%, #b55200 100%)",
                  }}
                />
                <span
                  className="relative inline-flex w-full h-full px-8 py-3 rounded-full bg-black/90
                  group-hover:bg-white/10 group-active:bg-white/10 transition-all duration-300"
                  style={{
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  }}
                >
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-accent/5 via-accent/10 to-accent/5 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300" />
                  <span className="relative font-mono text-xs tracking-[0.2em] uppercase text-white group-hover:text-accent group-active:text-accent transition-colors duration-300">
                    Get Early Access
                  </span>
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Clerk SignUp Modal with animated border */}
      <AnimatePresence>
        {showSignUp && (
          <>
            {/* Backdrop - click to close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[199] bg-black/60 backdrop-blur-sm"
              onClick={() => setShowSignUp(false)}
            />

            {/* Modal container with noise background */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4"
              onClick={() => setShowSignUp(false)}
            >
              <AnimatedMetalBorder
                containerClassName="rounded-2xl"
                borderWidth={4}
                borderRadius={16}
              >
                {/* Inner content container */}
                <div
                  className="clerk-signup-wrapper rounded-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* CSS to override Clerk fonts to Geist Mono and fix layout */}
                  <style jsx global>{`
                    .clerk-signup-wrapper .cl-rootBox,
                    .clerk-signup-wrapper .cl-card,
                    .clerk-signup-wrapper .cl-headerTitle,
                    .clerk-signup-wrapper .cl-headerSubtitle,
                    .clerk-signup-wrapper .cl-formFieldLabel,
                    .clerk-signup-wrapper .cl-formFieldInput,
                    .clerk-signup-wrapper .cl-formButtonPrimary,
                    .clerk-signup-wrapper .cl-footerActionText,
                    .clerk-signup-wrapper .cl-footerActionLink,
                    .clerk-signup-wrapper .cl-internal-b3fm6y,
                    .clerk-signup-wrapper * {
                      font-family: "Geist Mono", "Geist Mono Fallback", ui-monospace, SFMono-Regular,
                        "SF Mono", Menlo, Consolas, "Liberation Mono", monospace !important;
                    }
                    .clerk-signup-wrapper .cl-headerTitle {
                      letter-spacing: 0.05em !important;
                    }
                    .clerk-signup-wrapper .cl-headerSubtitle {
                      letter-spacing: 0.02em !important;
                    }
                    /* Smaller input text */
                    .clerk-signup-wrapper .cl-formFieldInput,
                    .clerk-signup-wrapper input[type="email"],
                    .clerk-signup-wrapper input {
                      font-size: 13px !important;
                      text-transform: none !important;
                      -webkit-text-transform: none !important;
                    }
                    .clerk-signup-wrapper .cl-formFieldInput::placeholder,
                    .clerk-signup-wrapper input::placeholder {
                      font-size: 13px !important;
                    }
                    /* Fix modal scrolling and max height */
                    .clerk-signup-wrapper {
                      max-height: 85vh;
                      overflow-y: auto;
                      scrollbar-width: thin;
                      scrollbar-color: rgba(181, 82, 0, 0.5) transparent;
                    }
                    .clerk-signup-wrapper::-webkit-scrollbar {
                      width: 6px;
                    }
                    .clerk-signup-wrapper::-webkit-scrollbar-track {
                      background: transparent;
                    }
                    .clerk-signup-wrapper::-webkit-scrollbar-thumb {
                      background: rgba(181, 82, 0, 0.5);
                      border-radius: 3px;
                    }
                    /* Ensure header is visible with proper padding */
                    .clerk-signup-wrapper .cl-card {
                      padding-top: 1.5rem !important;
                    }
                    .clerk-signup-wrapper .cl-header {
                      padding-top: 0.5rem !important;
                    }
                    /* Style social button sections with dividers */
                    .clerk-signup-wrapper .cl-socialButtons {
                      padding-bottom: 0.75rem !important;
                    }
                    /* Add subtle section styling for wallet buttons (Coinbase, MetaMask) */
                    .clerk-signup-wrapper .cl-socialButtonsBlockButton[data-provider="coinbase_wallet"],
                    .clerk-signup-wrapper .cl-socialButtonsBlockButton[data-provider="metamask"],
                    .clerk-signup-wrapper .cl-socialButtonsIconButton[data-provider="coinbase_wallet"],
                    .clerk-signup-wrapper .cl-socialButtonsIconButton[data-provider="metamask"] {
                      border-color: rgba(181, 82, 0, 0.3) !important;
                    }

                    /* Mobile responsive styles for SignUp */
                    @media (max-width: 640px) {
                      .clerk-signup-wrapper {
                        max-height: 80vh;
                        width: 100%;
                        max-width: 100vw;
                      }
                      .clerk-signup-wrapper .cl-rootBox {
                        width: 100% !important;
                        max-width: 100% !important;
                      }
                      .clerk-signup-wrapper .cl-card {
                        padding: 1rem !important;
                        width: 100% !important;
                      }
                      .clerk-signup-wrapper .cl-headerTitle {
                        font-size: 1.25rem !important;
                      }
                      .clerk-signup-wrapper .cl-headerSubtitle {
                        font-size: 0.75rem !important;
                      }
                      .clerk-signup-wrapper .cl-formFieldLabel {
                        font-size: 0.7rem !important;
                      }
                      .clerk-signup-wrapper .cl-formFieldInput,
                      .clerk-signup-wrapper input {
                        font-size: 16px !important; /* Prevents iOS zoom */
                        padding: 0.6rem !important;
                      }
                      .clerk-signup-wrapper .cl-formButtonPrimary {
                        font-size: 0.85rem !important;
                        padding: 0.7rem !important;
                      }
                      .clerk-signup-wrapper .cl-socialButtonsBlockButton {
                        padding: 0.6rem !important;
                      }
                      .clerk-signup-wrapper .cl-socialButtonsBlockButtonText {
                        font-size: 0.75rem !important;
                      }
                      .clerk-signup-wrapper .cl-dividerText {
                        font-size: 0.65rem !important;
                      }
                      .clerk-signup-wrapper .cl-footerActionText,
                      .clerk-signup-wrapper .cl-footerActionLink {
                        font-size: 0.75rem !important;
                      }
                      /* Use icon-only social buttons on mobile */
                      .clerk-signup-wrapper .cl-socialButtonsBlockButtonText__text {
                        display: none !important;
                      }
                      .clerk-signup-wrapper .cl-socialButtonsBlockButton {
                        justify-content: center !important;
                        min-width: auto !important;
                        padding: 0.75rem !important;
                      }
                    }

                    @media (max-width: 380px) {
                      .clerk-signup-wrapper .cl-card {
                        padding: 0.75rem !important;
                      }
                      .clerk-signup-wrapper .cl-headerTitle {
                        font-size: 1.1rem !important;
                      }
                      .clerk-signup-wrapper .cl-socialButtonsBlockButton {
                        padding: 0.5rem !important;
                      }
                    }
                  `}</style>
                  {isClerkEnabled === null || (isClerkEnabled && !clerkLoaded) ? (
                    /* Loading state while checking domain or waiting for Clerk to load */
                    <div className="p-8 text-center">
                      <p className="font-mono text-sm text-white/60 animate-pulse">Loading...</p>
                    </div>
                  ) : isClerkEnabled && clerkLoaded ? (
                    /* Clerk SignUp component - full sign up with social logins */
                    <>
                      <SignUp
                        routing="hash"
                        forceRedirectUrl="/?joined=true"
                        signInUrl="/sign-in"
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
                      {signUpError && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <p className="font-mono text-xs text-red-400">{signUpError}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Fallback for preview/non-production URLs */
                    <div className="p-8 text-center">
                      <p className="font-mono text-sm text-white mb-2">Join Preview</p>
                      <p className="font-mono text-xs text-white/60">
                        Visit <span className="text-accent">jettoptics.ai</span> to join
                      </p>
                    </div>
                  )}
                </div>
              </AnimatedMetalBorder>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Clerk UserProfile Modal - shows for signed-in users */}
      <AnimatePresence>
        {showUserProfile && (
          <>
            {/* Backdrop - click to close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[199] bg-black/60 backdrop-blur-sm"
              onClick={() => setShowUserProfile(false)}
            />

            {/* Modal container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4"
              onClick={() => setShowUserProfile(false)}
            >
              <AnimatedMetalBorder
                containerClassName="rounded-2xl w-full max-w-[900px]"
                borderWidth={4}
                borderRadius={16}
              >
                <div
                  className="clerk-profile-wrapper rounded-2xl w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <style jsx global>{`
                    .clerk-profile-wrapper .cl-rootBox,
                    .clerk-profile-wrapper .cl-card,
                    .clerk-profile-wrapper .cl-navbar,
                    .clerk-profile-wrapper .cl-navbarButton,
                    .clerk-profile-wrapper .cl-profileSection,
                    .clerk-profile-wrapper .cl-profileSectionTitle,
                    .clerk-profile-wrapper .cl-profileSectionContent,
                    .clerk-profile-wrapper .cl-formFieldLabel,
                    .clerk-profile-wrapper .cl-formFieldInput,
                    .clerk-profile-wrapper .cl-formButtonPrimary,
                    .clerk-profile-wrapper .cl-button {
                      font-family: var(--font-geist-mono), monospace !important;
                    }

                    .clerk-profile-wrapper .cl-rootBox {
                      width: 100% !important;
                      max-width: 900px !important;
                      min-height: 600px !important;
                    }

                    .clerk-profile-wrapper .cl-card {
                      background: rgba(45, 43, 85, 0.95) !important;
                      backdrop-filter: blur(20px) !important;
                      -webkit-backdrop-filter: blur(20px) !important;
                      border: none !important;
                      box-shadow: none !important;
                      width: 100% !important;
                      max-width: 900px !important;
                      min-height: 600px !important;
                    }

                    .clerk-profile-wrapper .cl-navbar {
                      background: rgba(24, 24, 27, 0.8) !important;
                      border-right: 1px solid rgb(39, 39, 42) !important;
                    }

                    .clerk-profile-wrapper .cl-profileSection {
                      border-color: rgb(39, 39, 42) !important;
                    }

                    .clerk-profile-wrapper .cl-formFieldInput {
                      background: rgba(24, 24, 27, 0.5) !important;
                      border-color: rgb(39, 39, 42) !important;
                      color: white !important;
                    }

                    .clerk-profile-wrapper .cl-formButtonPrimary {
                      background: #b55200 !important;
                    }

                    .clerk-profile-wrapper .cl-formButtonPrimary:hover {
                      background: #8a3f00 !important;
                    }

                    /* Custom header styling */
                    .clerk-profile-wrapper .custom-header {
                      background: rgba(24, 24, 27, 0.9) !important;
                      border-bottom: 1px solid rgb(39, 39, 42) !important;
                      z-index: 10 !important;
                    }

                    /* Mobile responsive styles for UserProfile */
                    @media (max-width: 768px) {
                      .clerk-profile-wrapper .cl-rootBox {
                        min-height: auto !important;
                        max-height: 75vh !important;
                        max-width: 95vw !important;
                      }
                      .clerk-profile-wrapper .cl-card {
                        min-height: auto !important;
                        max-height: 75vh !important;
                        flex-direction: column !important;
                        padding: 0 !important;
                        overflow: hidden !important;
                        background: rgba(45, 43, 85, 1) !important; /* Solid dark purple background */
                      }
                      .clerk-profile-wrapper .cl-navbar {
                        width: 100% !important;
                        border-right: none !important;
                        border-bottom: 1px solid rgb(39, 39, 42) !important;
                        padding: 0.5rem !important;
                        flex-direction: row !important;
                        justify-content: flex-start !important;
                        gap: 0.5rem !important;
                        overflow-x: auto !important;
                        background: rgba(24, 24, 27, 1) !important; /* Solid background */
                        backdrop-filter: none !important;
                        -webkit-backdrop-filter: none !important;
                      }
                      .clerk-profile-wrapper .cl-navbarButton {
                        padding: 0.5rem 0.75rem !important;
                        min-width: auto !important;
                        flex-shrink: 0 !important;
                        display: flex !important;
                        flex-direction: row !important;
                        align-items: center !important;
                        gap: 0.5rem !important;
                        background: transparent !important;
                        white-space: nowrap !important;
                      }
                      .clerk-profile-wrapper .cl-navbarButtonIcon {
                        margin-right: 0 !important;
                        width: 1rem !important;
                        height: 1rem !important;
                        flex-shrink: 0 !important;
                      }
                      /* Show text labels on mobile with proper styling */
                      .clerk-profile-wrapper .cl-navbarButton__label,
                      .clerk-profile-wrapper [class*="navbarButtonLabel"],
                      .clerk-profile-wrapper [class*="NavbarButtonLabel"] {
                        display: inline !important;
                        font-size: 0.75rem !important;
                        font-weight: 500 !important;
                      }
                      .clerk-profile-wrapper .cl-pageScrollBox {
                        padding: 0.75rem !important;
                        max-height: calc(75vh - 180px) !important;
                        overflow-y: auto !important;
                        background: rgba(45, 43, 85, 1) !important; /* Solid dark purple background */
                      }
                      .clerk-profile-wrapper .cl-profileSectionTitle {
                        font-size: 0.875rem !important;
                      }
                      .clerk-profile-wrapper .cl-profileSectionContent {
                        font-size: 0.75rem !important;
                      }
                      .clerk-profile-wrapper .cl-formFieldLabel {
                        font-size: 0.7rem !important;
                      }
                      .clerk-profile-wrapper .cl-formFieldInput {
                        font-size: 0.85rem !important;
                        padding: 0.5rem !important;
                      }
                      .clerk-profile-wrapper .custom-header {
                        padding: 0.5rem 0.75rem !important;
                        background: rgba(24, 24, 27, 1) !important; /* Solid background */
                      }
                      .clerk-profile-wrapper .custom-header .user-email {
                        font-size: 0.7rem !important;
                        max-width: 150px !important;
                      }
                    }

                    @media (max-width: 480px) {
                      .clerk-profile-wrapper .cl-rootBox {
                        max-width: 98vw !important;
                        width: 98vw !important;
                        max-height: 80vh !important;
                      }
                      .clerk-profile-wrapper .cl-card {
                        padding: 0 !important;
                      }
                      .clerk-profile-wrapper .cl-navbar {
                        padding: 0.375rem 0.5rem !important;
                      }
                      .clerk-profile-wrapper .cl-navbarButton {
                        padding: 0.375rem 0.625rem !important;
                        gap: 0.375rem !important;
                      }
                      .clerk-profile-wrapper .cl-navbarButtonIcon {
                        width: 0.875rem !important;
                        height: 0.875rem !important;
                      }
                      .clerk-profile-wrapper .cl-navbarButton__label,
                      .clerk-profile-wrapper [class*="navbarButtonLabel"],
                      .clerk-profile-wrapper [class*="NavbarButtonLabel"] {
                        font-size: 0.7rem !important;
                      }
                      .clerk-profile-wrapper .custom-header {
                        padding: 0.375rem 0.5rem !important;
                      }
                      .clerk-profile-wrapper .custom-header .user-email {
                        font-size: 0.65rem !important;
                        max-width: 120px !important;
                      }
                    }
                  `}</style>

                  {/* Custom header with sign-out button */}
                  <div className="custom-header flex items-center justify-between px-3 md:px-4 py-2 md:py-3 border-b border-zinc-800 bg-[#2d2b55]/80">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <User className="w-4 h-4 md:w-5 md:h-5 text-accent flex-shrink-0" />
                      <span className="user-email font-mono text-xs md:text-sm text-white truncate">
                        {user?.primaryEmailAddress?.emailAddress || "Profile"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                      <button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="flex items-center gap-1 px-2 py-1 md:px-3 md:py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 transition-all duration-200 font-mono text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <LogOut className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span className="hidden md:inline text-[10px] md:text-xs">
                          {isSigningOut ? "Signing out..." : "Sign Out"}
                        </span>
                      </button>
                      <button
                        onClick={() => setShowUserProfile(false)}
                        className="p-1 md:p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        aria-label="Close profile"
                      >
                        <X className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>
                  </div>

                  {isClerkEnabled ? (
                    <UserProfile
                      appearance={{
                        variables: {
                          colorPrimary: "#b55200",
                          colorDanger: "#ff4444",
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
                          navbar: "bg-zinc-900/80 border-zinc-800",
                          navbarButton: "text-white hover:bg-zinc-800",
                          profileSection: "border-zinc-800",
                          profileSectionTitle: "text-white",
                          formFieldLabel: "text-zinc-400",
                          formFieldInput: "bg-zinc-900/50 border-zinc-800 text-white",
                          formButtonPrimary: "bg-accent hover:bg-accent/90",
                        }
                      }}
                    />
                  ) : (
                    <div className="p-8 text-center">
                      <p className="font-mono text-sm text-white mb-2">Profile Unavailable</p>
                      <p className="font-mono text-xs text-white/60">
                        Visit <span className="text-accent">jettoptics.ai</span> to manage your profile
                      </p>
                    </div>
                  )}
                </div>
              </AnimatedMetalBorder>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="relative z-[5] w-[90vw] h-[90vh] max-w-[800px] max-h-[600px] object-contain border-transparent opacity-50 border-8"
      >
        <source
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OPTXloading-AFybU8f6imhbRHtfXrwTvpU4IP1OXQ.mp4"
          type="video/mp4"
        />
      </video>

      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-[6]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
