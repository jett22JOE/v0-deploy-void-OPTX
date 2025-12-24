"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Waitlist } from "@clerk/nextjs"
import { toast } from "sonner"
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background"
import { AnimatedMetalBorder } from "@/components/ui/animated-metal-border"

// Check if Clerk is available on this domain (matches ClerkProviderWrapper logic)
function useIsClerkEnabled() {
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null)
  useEffect(() => {
    const hostname = window.location.hostname
    const isClerkDomain = hostname === "jettoptics.ai" || hostname.endsWith(".jettoptics.ai") || hostname === "localhost"
    setIsEnabled(isClerkDomain)
  }, [])
  return isEnabled
}

export default function LoadingPage() {
  const [showButton, setShowButton] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isClerkEnabled = useIsClerkEnabled()
  const router = useRouter()

  useEffect(() => {
    // Show button after a delay or when video has played
    const timer = setTimeout(() => {
      setShowButton(true)
    }, 3000) // Show after 3 seconds

    return () => clearTimeout(timer)
  }, [])

  // Handle successful waitlist submission
  const handleSuccess = useCallback(() => {
    localStorage.setItem('waitlist_joined', 'true')
    // Show success toast
    toast.success("You're on the list!", {
      description: "We'll notify you when access is available.",
      duration: 3000,
    })
    // Close modal and redirect to home after delay
    setShowSignUp(false)
    setTimeout(() => {
      router.push('/')
    }, 2000)
  }, [router])

  // Fix autocapitalize on mobile for email inputs and detect successful waitlist submission
  useEffect(() => {
    if (showSignUp) {
      const fixAutocapitalize = () => {
        const inputs = document.querySelectorAll('.clerk-waitlist-wrapper input')
        inputs.forEach((input) => {
          input.setAttribute('autocapitalize', 'off')
          input.setAttribute('autocorrect', 'off')
          input.setAttribute('spellcheck', 'false')
          input.setAttribute('inputmode', 'email')
        })
      }

      // Detect when Clerk shows success state (user submitted email)
      const detectSuccess = () => {
        const wrapper = document.querySelector('.clerk-waitlist-wrapper')
        if (wrapper) {
          const successText = wrapper.textContent?.toLowerCase() || ''
          // Check for common success indicators from Clerk Waitlist component
          // Clerk 6.x may use different success messages
          if (successText.includes("you're on the list") ||
              successText.includes("on the list") ||
              successText.includes("check your email") ||
              successText.includes("thank you") ||
              successText.includes("we'll be in touch") ||
              successText.includes("successfully") ||
              successText.includes("you've joined") ||
              successText.includes("we'll let you know") ||
              successText.includes("waitlist") && successText.includes("joined")) {
            handleSuccess()
            return true
          }
          // Also check for Clerk's success UI elements
          const successIcon = wrapper.querySelector('[data-localization-key*="success"]')
          const successCard = wrapper.querySelector('.cl-card[data-state="success"]')
          if (successIcon || successCard) {
            handleSuccess()
            return true
          }
        }
        return false
      }

      // Use MutationObserver for more reliable detection
      const wrapper = document.querySelector('.clerk-waitlist-wrapper')
      let observer: MutationObserver | null = null

      if (wrapper) {
        observer = new MutationObserver(() => {
          if (detectSuccess()) {
            observer?.disconnect()
          }
        })
        observer.observe(wrapper, { childList: true, subtree: true, characterData: true })
      }

      // Run immediately and after delays (for Clerk's async rendering)
      fixAutocapitalize()
      const timer = setTimeout(fixAutocapitalize, 500)
      const timer2 = setTimeout(fixAutocapitalize, 1000)

      // Also check periodically as backup
      const successCheckInterval = setInterval(() => {
        if (detectSuccess()) {
          clearInterval(successCheckInterval)
        }
      }, 1000)

      return () => {
        clearTimeout(timer)
        clearTimeout(timer2)
        clearInterval(successCheckInterval)
        observer?.disconnect()
      }
    }
  }, [showSignUp, handleSuccess])

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

      {/* Join Waitlist Button - shows when not signed up */}
      {!showSignUp && (
        <div className="absolute top-[20vh] left-1/2 -translate-x-1/2 md:top-[calc(50%_-_320px)] z-20 flex flex-col items-center gap-6">
          <AnimatePresence>
            {showButton && (
              <motion.button
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                onClick={() => setShowSignUp(true)}
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
                    Join Waitlist
                  </span>
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Clerk Waitlist Modal with animated border */}
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
                  className="overflow-hidden clerk-waitlist-wrapper"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* CSS to override Clerk fonts to Geist Mono */}
                  <style jsx global>{`
                    .clerk-waitlist-wrapper .cl-rootBox,
                    .clerk-waitlist-wrapper .cl-card,
                    .clerk-waitlist-wrapper .cl-headerTitle,
                    .clerk-waitlist-wrapper .cl-headerSubtitle,
                    .clerk-waitlist-wrapper .cl-formFieldLabel,
                    .clerk-waitlist-wrapper .cl-formFieldInput,
                    .clerk-waitlist-wrapper .cl-formButtonPrimary,
                    .clerk-waitlist-wrapper .cl-footerActionText,
                    .clerk-waitlist-wrapper .cl-footerActionLink,
                    .clerk-waitlist-wrapper .cl-internal-b3fm6y,
                    .clerk-waitlist-wrapper * {
                      font-family: "Geist Mono", "Geist Mono Fallback", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace !important;
                    }
                    .clerk-waitlist-wrapper .cl-headerTitle {
                      letter-spacing: 0.05em !important;
                    }
                    .clerk-waitlist-wrapper .cl-headerSubtitle {
                      letter-spacing: 0.02em !important;
                    }
                    /* Smaller input text */
                    .clerk-waitlist-wrapper .cl-formFieldInput,
                    .clerk-waitlist-wrapper input[type="email"],
                    .clerk-waitlist-wrapper input {
                      font-size: 13px !important;
                      text-transform: none !important;
                      -webkit-text-transform: none !important;
                    }
                    .clerk-waitlist-wrapper .cl-formFieldInput::placeholder,
                    .clerk-waitlist-wrapper input::placeholder {
                      font-size: 13px !important;
                    }
                  `}</style>
                  {isClerkEnabled === null ? (
                    /* Loading state while checking domain */
                    <div className="p-8 text-center">
                      <p className="font-mono text-sm text-white/60 animate-pulse">Loading...</p>
                    </div>
                  ) : isClerkEnabled ? (
                    <Waitlist />
                  ) : (
                    /* Fallback for preview/non-production URLs */
                    <div className="p-8 text-center">
                      <p className="font-mono text-sm text-white mb-2">Waitlist Preview</p>
                      <p className="font-mono text-xs text-white/60">
                        Visit <span className="text-accent">jettoptics.ai</span> to join the waitlist
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
        <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OPTXloading-AFybU8f6imhbRHtfXrwTvpU4IP1OXQ.mp4" type="video/mp4" />
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
