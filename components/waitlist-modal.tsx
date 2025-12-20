"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useCallback, useState } from "react"
import Image from "next/image"

interface WaitlistModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

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

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Show success state
    setSubmitted(true)
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
            className="fixed inset-0 z-[201] flex items-center justify-center p-4 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="waitlist-title"
          >
            <div
              className="w-full max-w-lg bg-[#0a0a0a]/80 rounded-2xl border border-white/10 p-0 backdrop-blur-lg"
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
                    JOE AI — DEPIN
                  </p>

                  {/* Title */}
                  <h2
                    id="waitlist-title"
                    className="font-sans text-2xl md:text-3xl font-light tracking-tight text-white mb-2"
                  >
                    <span className="text-accent">Jett</span> Optics
                  </h2>

                  {/* Tagline */}
                  <p className="font-mono text-xs tracking-wider text-muted-foreground">Spatial Encryption</p>
                </div>

                {/* Content */}
                <div className="relative px-6 py-6">
                  {/* Value proposition */}
                  <div className="mb-6 space-y-3">
                    <p className="font-mono text-xs text-center text-muted-foreground leading-relaxed">
                      Join the waitlist for early access to quantum-resistant, decentralized spatial encryption.
                    </p>

                    {/* Feature pills */}
                    <div className="flex flex-wrap justify-center gap-2">
                      {["Quantum-Resistant", "DePIN", "Decentralized"].map((feature) => (
                        <span
                          key={feature}
                          className="font-mono text-[10px] tracking-wider px-3 py-1 border border-white/20 rounded-full text-muted-foreground"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>


                  {!submitted ? (
                    /* Waitlist form */
                    <div className="space-y-4">
                      <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                            placeholder="your@email.com"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg
                              font-mono text-sm text-white placeholder:text-muted-foreground
                              focus:outline-none focus:border-accent/50 transition-colors"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full px-4 py-3 bg-accent hover:bg-accent/80 rounded-lg
                            font-mono text-xs tracking-wider uppercase text-white
                            transition-colors duration-300"
                        >
                          Join Waitlist
                        </button>
                      </form>
                    </div>
                  ) : (
                    /* Success confirmation */
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
                      <h3 className="font-sans text-xl text-white mb-2">You&apos;re on the list!</h3>
                      <p className="font-mono text-xs text-muted-foreground">
                        We&apos;ll notify you when early access is available.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="relative px-6 pb-6 text-center">
                  <p className="font-mono text-[10px] tracking-wider text-muted-foreground/60">
                    By joining, you agree to receive updates about <span className="text-accent">JOE</span> AI spatial
                    encryption technology.
                  </p>
                </div>

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
