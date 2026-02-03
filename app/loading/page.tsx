"use client"

// Force dynamic rendering to avoid SSR issues with Clerk/Convex
export const dynamic = 'force-dynamic'

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useSafeClerk, useSafeAuth, useSafeUser, useSafeQuery } from "@/lib/hooks/use-safe-auth"
import { api } from "@/convex/_generated/api"
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background"

export default function LoadingPage() {
  const router = useRouter()
  const [showButton, setShowButton] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Verify Clerk is loaded before allowing submission
  const { loaded: clerkLoaded } = useSafeClerk()
  const { isSignedIn } = useSafeAuth()
  const { user } = useSafeUser()

  // Check subscription status from Convex
  const devStatus = useSafeQuery(
    api.dev.getUserDevStatus,
    user?.id ? { clerkUserId: user.id } : "skip"
  )

  useEffect(() => {
    // Show button after a delay or when video has played
    const timer = setTimeout(() => {
      setShowButton(true)
    }, 3000) // Show after 3 seconds

    return () => clearTimeout(timer)
  }, [])

  // Redirect signed-in users to /security page
  useEffect(() => {
    if (isSignedIn && clerkLoaded && devStatus !== undefined) {
      // Redirect all signed-in users to security page
      router.push("/security")
    }
  }, [isSignedIn, clerkLoaded, devStatus, router])

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

      {/* Get Early Access Button - shows when not signed in */}
      {!isSignedIn && (
        <div className="absolute top-[20vh] left-1/2 -translate-x-1/2 md:top-[calc(50%_-_320px)] z-20 flex flex-col items-center gap-6">
          <AnimatePresence>
            {showButton && (
              <motion.button
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                onClick={() => router.push("/optx-login?tab=signup")}
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

      {/* Loading indicator for signed-in users */}
      {isSignedIn && (
        <div className="absolute top-[20vh] left-1/2 -translate-x-1/2 md:top-[calc(50%_-_320px)] z-20 flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent" />
          <p className="font-mono text-xs text-zinc-500">Redirecting to account...</p>
        </div>
      )}

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
