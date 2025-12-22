"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useRef, useState, useEffect, useCallback } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { SentientSphere } from "./sentient-sphere"

export function Hero() {
  const router = useRouter()
  const containerRef = useRef<HTMLElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const [isMobile, setIsMobile] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [holdProgress, setHoldProgress] = useState(0)
  const [isHolding, setIsHolding] = useState(false)
  const [countdown, setCountdown] = useState(2.22)
  const holdStartTimeRef = useRef<number | null>(null)
  const holdAnimationRef = useRef<number | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const HOLD_DURATION = 2220 // 2.22 seconds in ms

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches || "ontouchstart" in window)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const updateHoldProgress = useCallback(() => {
    if (holdStartTimeRef.current === null) return

    const elapsed = Date.now() - holdStartTimeRef.current
    const progress = Math.min(elapsed / HOLD_DURATION, 1)
    setHoldProgress(progress)
    setCountdown(Math.max(0, (HOLD_DURATION - elapsed) / 1000))

    if (progress >= 1) {
      router.push("/loading")
      return
    }

    holdAnimationRef.current = requestAnimationFrame(updateHoldProgress)
  }, [router])

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isMobile) return

      e.preventDefault()

      holdStartTimeRef.current = Date.now()
      setIsHolding(true)
      setHoldProgress(0)
      setCountdown(2.22)
      holdAnimationRef.current = requestAnimationFrame(updateHoldProgress)
    },
    [isMobile, updateHoldProgress],
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isMobile) return

      e.preventDefault()

      const elapsed = holdStartTimeRef.current ? Date.now() - holdStartTimeRef.current : 0

      if (holdAnimationRef.current) {
        cancelAnimationFrame(holdAnimationRef.current)
        holdAnimationRef.current = null
      }
      holdStartTimeRef.current = null
      setIsHolding(false)
      setHoldProgress(0)
      setCountdown(2.22)

      if (elapsed < 300) {
        if (videoRef.current) {
          if (isVideoPlaying) {
            videoRef.current.pause()
            videoRef.current.currentTime = 0
            setIsVideoPlaying(false)
          } else {
            setIsVideoPlaying(true)
          }
        } else {
          setIsVideoPlaying((prev) => !prev)
        }
      }
    },
    [isMobile, isVideoPlaying],
  )

  const handleTouchCancel = useCallback(() => {
    if (holdAnimationRef.current) {
      cancelAnimationFrame(holdAnimationRef.current)
      holdAnimationRef.current = null
    }
    holdStartTimeRef.current = null
    setIsHolding(false)
    setHoldProgress(0)
    setCountdown(2.22)
  }, [])

  useEffect(() => {
    return () => {
      if (holdAnimationRef.current) {
        cancelAnimationFrame(holdAnimationRef.current)
      }
    }
  }, [])

  const circleRadius = 76
  const circleSize = 160
  const circumference = 2 * Math.PI * circleRadius

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden bg-[#050505]">
      <div className="absolute inset-0">
        <SentientSphere />
      </div>

      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 h-full flex flex-col justify-between p-8 pt-24 pb-32 md:p-12 md:px-12 md:py-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <p className="font-mono text-xs tracking-[0.3em] text-accent mb-2">0PTX — OPTICS</p>
          <h2 className="font-sans text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-balance">
            JETT OPTICAL
            <br />
            <span className="italic"> ENCRYPTION</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
        >
          {isMobile && (
            <svg
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 pointer-events-none z-50"
              width={circleSize}
              height={circleSize}
              viewBox={`0 0 ${circleSize} ${circleSize}`}
              style={{
                opacity: isHolding ? 1 : 0,
                transition: "opacity 0.15s ease-out",
              }}
            >
              <circle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={circleRadius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="4"
              />
              <circle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={circleRadius}
                fill="none"
                stroke="#f97316"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - holdProgress)}
                style={{
                  filter: "drop-shadow(0 0 10px #f97316) drop-shadow(0 0 20px #f97316)",
                }}
              />
            </svg>
          )}

          <motion.button
            data-cursor-hover
            onMouseEnter={() => !isMobile && setIsHovered(true)}
            onMouseLeave={() => !isMobile && setIsHovered(false)}
            onClick={() => !isMobile && router.push("/loading")}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
            onTouchMove={handleTouchCancel}
            onContextMenu={(e) => e.preventDefault()}
            whileHover={!isMobile ? { scale: 1.05 } : undefined}
            whileTap={!isMobile ? { scale: 0.95 } : undefined}
            className="relative w-40 h-40 md:w-48 md:h-48 rounded-full border border-white/20 overflow-hidden flex items-center justify-center group select-none"
            style={{
              WebkitTouchCallout: "none",
              WebkitUserSelect: "none",
              touchAction: "manipulation",
            }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-900/20 to-orange-900/20 pointer-events-none" />

            <AnimatePresence mode="wait">
              {isHolding ? (
                <motion.div
                  key="countdown"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col items-center justify-center z-30"
                >
                  <span className="font-mono text-3xl md:text-4xl font-bold text-accent tabular-nums">
                    {countdown.toFixed(2)}
                  </span>
                  <span className="font-mono text-[10px] tracking-widest text-muted-foreground mt-1">HOLD</span>
                </motion.div>
              ) : !isHovered && !isVideoPlaying ? (
                <motion.span
                  key="text"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="font-mono text-xs md:text-sm tracking-widest uppercase text-white text-center px-4 relative z-10"
                >
                  ENTER SPACE
                </motion.span>
              ) : (
                <motion.video
                  key="video"
                  ref={videoRef}
                  initial={{ opacity: 0, scale: 1.2 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/astroknots%20portal%202-iGjqkjshc1gtCHAfgfmEPxmyuMv6x1.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover rounded-full z-20"
                />
              )}
            </AnimatePresence>

            <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse z-30" />
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute bottom-28 right-8 md:relative md:bottom-auto md:right-auto md:self-end text-right"
        >
          <p className="font-mono text-xs tracking-[0.3em] text-accent mb-2">UX — 0PTX</p>
          <h2 className="font-sans text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-balance">
            SPATIAL
            <br />
            <span className="italic">INTERFACE</span>
          </h2>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  )
}
