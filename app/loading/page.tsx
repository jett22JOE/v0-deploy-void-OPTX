"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Waitlist } from "@clerk/nextjs"
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background"
import { NoiseBackground } from "@/components/ui/noise-background"

// Check if Clerk is available on this domain
function useIsClerkEnabled() {
  const [isEnabled, setIsEnabled] = useState(false)
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

  useEffect(() => {
    // Show button after a delay or when video has played
    const timer = setTimeout(() => {
      setShowButton(true)
    }, 3000) // Show after 3 seconds

    return () => clearTimeout(timer)
  }, [])

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
          // Look for success indicators in the Clerk component
          const successText = wrapper.textContent?.toLowerCase() || ''
          if (successText.includes("you're on the list") ||
              successText.includes("waitlist") && successText.includes("joined") ||
              successText.includes("thank you") ||
              successText.includes("we'll be in touch")) {
            localStorage.setItem('waitlist_joined', 'true')
          }
        }
      }

      // Run immediately and after delays (for Clerk's async rendering)
      fixAutocapitalize()
      const timer = setTimeout(fixAutocapitalize, 500)
      const timer2 = setTimeout(fixAutocapitalize, 1000)

      // Check for success state periodically while modal is open
      const successCheckInterval = setInterval(detectSuccess, 500)

      return () => {
        clearTimeout(timer)
        clearTimeout(timer2)
        clearInterval(successCheckInterval)
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
              <NoiseBackground
                containerClassName="rounded-2xl"
                gradientColors={[
                  "rgb(181, 82, 0)",
                  "rgb(255, 140, 0)",
                  "rgb(181, 82, 0)",
                ]}
                noiseIntensity={0.1}
              >
                {/* Inner content container */}
                <div
                  className="rounded-xl bg-[#1a1625] overflow-hidden clerk-waitlist-wrapper"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* CSS to override Clerk fonts to mono and fix placeholder */}
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
                      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace !important;
                    }
                    .clerk-waitlist-wrapper .cl-headerTitle {
                      letter-spacing: 0.05em !important;
                    }
                    .clerk-waitlist-wrapper .cl-headerSubtitle {
                      letter-spacing: 0.02em !important;
                    }
                    .clerk-waitlist-wrapper .cl-formFieldInput::placeholder {
                      content: "Email address" !important;
                    }
                    .clerk-waitlist-wrapper input[placeholder]::placeholder {
                      font-size: 14px !important;
                    }
                    /* Disable auto-capitalize for email input */
                    .clerk-waitlist-wrapper .cl-formFieldInput,
                    .clerk-waitlist-wrapper input[type="email"],
                    .clerk-waitlist-wrapper input {
                      text-transform: none !important;
                      autocapitalize: off !important;
                      -webkit-text-transform: none !important;
                    }
                  `}</style>
                  {isClerkEnabled ? (
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
              </NoiseBackground>
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
