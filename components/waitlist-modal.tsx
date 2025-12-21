"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useCallback, useState } from "react"
import Image from "next/image"
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { SignUpButton, useAuth } from "@clerk/nextjs"

interface WaitlistModalProps {
  isOpen: boolean
  onClose: () => void
}

type Step = "auth" | "waitlist" | "success"

// Check if we're on production domain where Clerk is enabled
function useIsClerkEnabled() {
  const [isEnabled, setIsEnabled] = useState(false)
  useEffect(() => {
    const hostname = window.location.hostname
    const isProduction = hostname === "jettoptics.ai" || hostname.endsWith(".jettoptics.ai")
    setIsEnabled(isProduction)
  }, [])
  return isEnabled
}

// Safe hook to get Clerk auth state - returns false when Clerk is not available
function useSafeClerkAuth(isClerkEnabled: boolean) {
  const [isSignedIn, setIsSignedIn] = useState(false)

  // Only try to use Clerk auth when enabled (client-side only)
  let clerkAuth: { isSignedIn: boolean | undefined; userId: string | null | undefined } = { isSignedIn: undefined, userId: undefined }
  try {
    // This will throw during SSG, so we catch it
    // eslint-disable-next-line react-hooks/rules-of-hooks
    clerkAuth = useAuth()
  } catch {
    // Clerk not available (SSG or non-production)
  }

  useEffect(() => {
    if (isClerkEnabled && clerkAuth.isSignedIn) {
      setIsSignedIn(true)
    }
  }, [isClerkEnabled, clerkAuth.isSignedIn])

  return { isSignedIn: isClerkEnabled && isSignedIn }
}

export function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [step, setStep] = useState<Step>("auth")
  const [error, setError] = useState<string | null>(null)
  const isClerkEnabled = useIsClerkEnabled()
  const { isSignedIn } = useSafeClerkAuth(isClerkEnabled)

  // Fallback email form state for localhost
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const addToWaitlistSimple = useMutation(api.waitlist.addToWaitlist)

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isOpen, handleKeyDown])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep("auth")
      setError(null)
      setEmail("")
    }
  }, [isOpen])

  // When user signs in via Clerk, move to waitlist step
  useEffect(() => {
    if (isOpen && isSignedIn && step === "auth" && isClerkEnabled) {
      // User just signed in, move to waitlist step
      setStep("waitlist")
    }
  }, [isOpen, isSignedIn, step, isClerkEnabled])

  // Handle waitlist submission (both production and localhost)
  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await addToWaitlistSimple({
        email,
        source: isClerkEnabled ? "clerk-oauth" : "waitlist-modal",
      })
      setStep("success")
    } catch (err) {
      if (err instanceof Error && err.message.includes("already registered")) {
        setError("This email is already on the waitlist!")
      } else {
        setError("Something went wrong. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Get tagline based on step
  const getTagline = () => {
    switch (step) {
      case "auth":
        return "Create Your Account"
      case "waitlist":
        return "Join the Waitlist"
      case "success":
        return "Welcome to the Future"
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[201] flex items-start md:items-center justify-center p-4 pt-16 md:pt-4 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="waitlist-title"
          >
            <div
              className="w-full max-w-lg bg-[#0a0a0a]/80 rounded-2xl border border-white/10 p-0 backdrop-blur-lg my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="relative w-full bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] rounded-2xl overflow-hidden"
              >
                {/* Subtle gradient glow */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse at top right, rgba(181, 82, 0, 0.08) 0%, transparent 60%)",
                  }}
                />

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2 rounded-lg hover:bg-white/5 transition-colors group"
                  aria-label="Close modal"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-accent group-hover:text-white transition-colors"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>

                {/* Header */}
                <div className="relative px-6 pt-8 pb-4 text-center border-b border-white/5">
                  {/* Logo */}
                  <div className="flex justify-center mb-4">
                    <div className="relative w-16 h-16">
                      <Image src="/images/jettoptics-logo.png" alt="JettOptics Logo" fill className="object-contain" />
                    </div>
                  </div>

                  {/* Brand label */}
                  <p className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase mb-2">
                    JOE AI - AUTH
                  </p>

                  {/* Title */}
                  <h2
                    id="waitlist-title"
                    className="font-sans text-2xl md:text-3xl font-light tracking-tight text-white mb-2"
                  >
                    <span className="text-accent">Jett</span> Optics
                  </h2>

                  {/* Tagline */}
                  <p className="font-mono text-xs tracking-wider text-muted-foreground">
                    {getTagline()}
                  </p>
                </div>

                {/* Content */}
                <div className="relative px-6 py-6">
                  {/* Step 1: Auth (Clerk SignUp button on production, email form on localhost) */}
                  {step === "auth" && (
                    <>
                      {/* Value proposition */}
                      <div className="mb-6 space-y-3">
                        <p className="font-mono text-xs text-center text-muted-foreground leading-relaxed">
                          Sign up for early access to quantum-resistant, decentralized spatial encryption.
                        </p>

                        {/* Feature pills */}
                        <div className="flex flex-wrap justify-center gap-2">
                          {["Quantum-Resistant", "DePIN", "Evolve"].map((feature) => (
                            <span
                              key={feature}
                              className="font-mono text-[10px] tracking-wider px-3 py-1 border border-white/20 rounded-full text-muted-foreground"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      {error && (
                        <p className="font-mono text-xs text-red-400 text-center mb-4">{error}</p>
                      )}

                      {/* Production: Clerk SignUpButton opens native modal */}
                      {isClerkEnabled ? (
                        <div className="space-y-4">
                          <SignUpButton mode="modal">
                            <HoverBorderGradient
                              as="button"
                              containerClassName="w-full rounded-lg"
                              className="w-full px-4 py-3 bg-[#0a0a0a] rounded-lg font-mono text-xs tracking-wider uppercase text-white"
                              duration={0.8}
                            >
                              Sign Up with Google, X, or Apple
                            </HoverBorderGradient>
                          </SignUpButton>
                          <p className="font-mono text-[10px] text-center text-muted-foreground/60">
                            After signing up, you&apos;ll be added to the waitlist
                          </p>
                        </div>
                      ) : (
                        /* Localhost: Direct email form to waitlist */
                        <div className="space-y-4">
                          <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                            <div>
                              <label htmlFor="email" className="block font-mono text-xs text-muted-foreground mb-2">
                                Email Address
                              </label>
                              <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                                placeholder="your@email.com"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg
                                  font-mono text-sm text-white placeholder:text-muted-foreground
                                  focus:outline-none focus:border-accent/50 transition-colors
                                  disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </div>
                            <HoverBorderGradient
                              as="button"
                              type="submit"
                              disabled={isLoading}
                              containerClassName="w-full rounded-lg"
                              className="w-full px-4 py-3 bg-[#0a0a0a] rounded-lg font-mono text-xs tracking-wider uppercase text-white disabled:opacity-50"
                              duration={0.8}
                            >
                              {isLoading ? "Joining..." : "Join Waitlist"}
                            </HoverBorderGradient>
                          </form>
                          <p className="font-mono text-[10px] text-center text-muted-foreground/60">
                            OAuth sign-up (Google, X, Apple) available on production
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Step 2: Waitlist form after Clerk auth (production only) */}
                  {step === "waitlist" && (
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-accent/20 flex items-center justify-center">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-accent"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <p className="font-mono text-xs text-muted-foreground">
                          Account created! Now join our waitlist.
                        </p>
                      </div>

                      {error && (
                        <p className="font-mono text-xs text-red-400 text-center mb-4">{error}</p>
                      )}

                      <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                        <div>
                          <label htmlFor="waitlist-email" className="block font-mono text-xs text-muted-foreground mb-2">
                            Confirm Email for Waitlist
                          </label>
                          <input
                            type="email"
                            id="waitlist-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                            placeholder="your@email.com"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg
                              font-mono text-sm text-white placeholder:text-muted-foreground
                              focus:outline-none focus:border-accent/50 transition-colors
                              disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>
                        <HoverBorderGradient
                          as="button"
                          type="submit"
                          disabled={isLoading}
                          containerClassName="w-full rounded-lg"
                          className="w-full px-4 py-3 bg-[#0a0a0a] rounded-lg font-mono text-xs tracking-wider uppercase text-white disabled:opacity-50"
                          duration={0.8}
                        >
                          {isLoading ? "Joining..." : "Join Waitlist"}
                        </HoverBorderGradient>
                      </form>
                    </div>
                  )}

                  {/* Step 3: Success */}
                  {step === "success" && (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-accent"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <h3 className="font-sans text-xl text-white mb-2">You&apos;re all set!</h3>
                      <p className="font-mono text-xs text-muted-foreground mb-4">
                        {isClerkEnabled
                          ? "Your account is created and you're on the waitlist."
                          : "You're on the waitlist. We'll be in touch!"}
                      </p>
                      <button
                        onClick={onClose}
                        className="font-mono text-xs text-accent hover:text-accent/80 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {(step === "auth" || step === "waitlist") && (
                  <div className="relative px-6 pb-6 text-center">
                    <p className="font-mono text-[10px] tracking-wider text-muted-foreground/60">
                      By joining, you agree to receive updates about <span className="text-accent">JOE</span> AI spatial
                      encryption technology.
                    </p>
                  </div>
                )}

                {/* Noise texture */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.02]"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                  }}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
