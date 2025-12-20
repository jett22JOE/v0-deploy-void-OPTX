"use client"

import { motion, AnimatePresence } from "framer-motion"
import { SignUp } from "@clerk/nextjs"
import { useEffect, useCallback } from "react"
import Image from "next/image"
import { ClerkCustomClose } from "./clerk-custom-close"

interface WaitlistModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <ClerkCustomClose />
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
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Orange glow effect */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse at top, rgba(181, 82, 0, 0.15) 0%, transparent 50%)",
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
                  0PTX — OPTICS
                </p>

                {/* Title */}
                <h2
                  id="waitlist-title"
                  className="font-sans text-2xl md:text-3xl font-light tracking-tight text-white mb-2"
                >
                  <span className="text-accent">JETT</span> OPTICAL
                </h2>

                {/* Tagline */}
                <p className="font-mono text-xs tracking-wider text-muted-foreground">Your gaze becomes the key</p>
              </div>

              {/* Content */}
              <div className="relative px-6 py-6">
                {/* Value proposition */}
                <div className="mb-6 space-y-3">
                  <p className="font-mono text-xs text-center text-muted-foreground leading-relaxed">
                    Join the waitlist for early access to quantum-resistant, hands-free optical encryption technology.
                  </p>

                  {/* Feature pills */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {["Quantum-Resistant", "Hands-Free", "Inevitable"].map((feature) => (
                      <span
                        key={feature}
                        className="font-mono text-[10px] tracking-wider px-3 py-1 border border-white/20 rounded-full text-muted-foreground"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Clerk SignUp */}
                <div className="clerk-waitlist-container">
                  <SignUp
                    appearance={{
                      elements: {
                        rootBox: "w-full",
                        card: "bg-transparent shadow-none p-0",
                        cardBox: "bg-transparent shadow-none",
                        header: "hidden",
                        headerTitle: "hidden",
                        headerSubtitle: "hidden",
                        socialButtonsBlockButton:
                          "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent/50 transition-all",
                        socialButtonsBlockButtonText: "font-mono text-xs text-white",
                        dividerLine: "bg-white/10",
                        dividerText: "font-mono text-xs text-muted-foreground",
                        formFieldLabel: "font-mono text-xs text-muted-foreground",
                        formFieldInput:
                          "bg-white/5 border-white/10 focus:border-accent/50 font-mono text-sm text-white placeholder:text-muted-foreground",
                        formButtonPrimary: "bg-accent hover:bg-accent/80 font-mono text-xs tracking-wider uppercase",
                        footerAction: "hidden",
                        footer: "hidden",
                        identityPreview: "bg-white/5 border-white/10",
                        identityPreviewText: "font-mono text-xs text-white",
                        identityPreviewEditButton: "text-accent hover:text-accent/80",
                        formFieldSuccessText: "text-accent font-mono text-xs",
                        formFieldErrorText: "text-red-500 font-mono text-xs",
                        otpCodeFieldInput: "bg-white/5 border-white/10 text-white font-mono",
                        formResendCodeLink: "text-accent hover:text-accent/80 font-mono text-xs",
                      },
                      variables: {
                        colorPrimary: "#b55200",
                        colorText: "#ffffff",
                        colorTextSecondary: "#a1a1aa",
                        colorBackground: "transparent",
                        colorInputBackground: "rgba(255, 255, 255, 0.05)",
                        colorInputText: "#ffffff",
                        borderRadius: "0.5rem",
                      },
                    }}
                    routing="hash"
                    signInUrl="/sign-in"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="relative px-6 pb-6 text-center">
                <p className="font-mono text-[10px] tracking-wider text-muted-foreground/60">
                  By joining, you agree to receive updates about <span className="text-accent">JETT</span> Optical
                  technology.
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
