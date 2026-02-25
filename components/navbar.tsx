"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { LiquidMetalCircle } from "@/components/ui/liquid-metal-circle"

const navLinks = [
  { label: "SPATIAL UX", href: "#spatial-encryption" },
  { label: "JOE AI", href: "#joe-agent" },
  { label: "Contact", href: "#contact" },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLogoHovered, setIsLogoHovered] = useState(false)
  const [isMobileLogoPressed, setIsMobileLogoPressed] = useState(false)
  const [pulsingButton, setPulsingButton] = useState<number | null>(null)
  const cursorPosRef = useRef({ x: 0, y: 0 })
  const cursorElementRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      if (isLogoHovered) {
        video.currentTime = 0
        video.play().catch(() => {})
      } else {
        video.pause()
        video.currentTime = 0
      }
    }
  }, [isLogoHovered])

  const scrollToSection = (href: string) => {
    setIsMenuOpen(false)

    if (href === "#contact") {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      })
      return
    }

    const element = document.querySelector(href)
    if (element) {
      const navbar = document.querySelector("header")
      const navbarHeight = navbar?.offsetHeight || 0
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - navbarHeight

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  const handleNavTouchStart = (index: number) => {
    setPulsingButton(index)
  }

  const handleNavTouchEnd = () => {
    setTimeout(() => setPulsingButton(null), 300)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    cursorPosRef.current = { x: e.clientX, y: e.clientY }
    if (cursorElementRef.current) {
      cursorElementRef.current.style.left = `${e.clientX - 40}px`
      cursorElementRef.current.style.top = `${e.clientY - 40}px`
    }
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 pt-4"
      >
        <nav className="relative flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
          {/* Left: Δ ASTRO.KNOTS Branding */}
          <Link href="https://astroknots.space" className="group flex items-center gap-2">
            <div className="relative w-8 h-8 md:w-6 md:h-6 flex items-center justify-center">
              <span className="relative flex h-full w-full">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <Image
                  src="/images/astroknots-logo.png"
                  alt="Astro Knots"
                  width={32}
                  height={32}
                  className="relative inline-flex rounded-full object-contain"
                />
              </span>
            </div>
            <span className="font-mono text-xs tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-300">
              <span className="text-accent">Δ</span>{" "}ASTRO.KNOTS
            </span>
          </Link>

          {/* Center: Navigation Links with glass pill (Desktop only) */}
          <div
            className="hidden md:block relative rounded-2xl backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-500"
            style={{
              WebkitBackdropFilter: "blur(20px) saturate(120%)",
              backgroundColor: "rgba(0, 0, 0, 0.45)",
            }}
          >
            {/* Top highlight edge */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent rounded-t-2xl" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.03] via-transparent to-white/[0.02] pointer-events-none" />
            <ul className="relative flex items-center gap-2 px-2 py-1">
              {navLinks.map((link, index) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="group relative font-mono text-xs tracking-wider text-white/70 hover:text-white transition-all duration-300 px-4 py-2 rounded-xl hover:bg-white/[0.08]"
                  >
                    <span className="text-accent mr-1">0{index + 1}</span>
                    {link.label.toUpperCase()}
                    <span className="absolute bottom-1 left-4 right-4 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Vault + UX Docs + Logo Button */}
          <div className="relative flex items-center gap-3">
            {/* UX Docs Link (Desktop) */}
            <div className="hidden md:block">
              <Link
                href="/docs"
                className="group relative font-mono text-xs tracking-wider text-muted-foreground hover:text-foreground transition-all duration-300 px-3 py-2 rounded-xl hover:bg-white/[0.05]"
              >
                <span className="text-accent mr-1">UX</span>
                Docs
                <span className="absolute bottom-1 left-3 right-3 h-px bg-gradient-to-r from-transparent via-foreground to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </div>

            {/* Desktop Logo Button */}
            <div className="hidden md:block">
              <Link
                href="/loading"
                onMouseEnter={() => setIsLogoHovered(true)}
                onMouseLeave={() => setIsLogoHovered(false)}
                onMouseMove={handleMouseMove}
                className="flex items-center group relative"
                style={{
                  cursor: isLogoHovered ? "none" : "pointer",
                }}
              >
                <div
                  className={`relative w-11 h-11 overflow-hidden rounded-xl flex items-center justify-center transition-all duration-500 border border-accent/40 ${
                    isLogoHovered
                      ? "shadow-[0_0_20px_rgba(181,82,0,0.5),0_0_40px_rgba(181,82,0,0.2)]"
                      : "shadow-[0_0_15px_rgba(181,82,0,0.3),0_0_30px_rgba(181,82,0,0.1)]"
                  }`}
                  style={{
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    background: isLogoHovered
                      ? "radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.4) 4%, rgba(255, 255, 255, 1) 100%)"
                      : "radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.4) 8%, rgba(255, 255, 255, 1) 100%)",
                  }}
                >
                  {/* Logo */}
                  <Image
                    src="/images/jettoptics-logo.png"
                    alt="JettOptics Logo"
                    width={28}
                    height={28}
                    className="object-contain relative z-10"
                  />
                </div>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden relative"
              aria-label="Toggle menu"
            >
              <div
                className="relative w-11 h-11 overflow-hidden rounded-xl flex items-center justify-center transition-all duration-500 active:scale-95 border border-accent/40 shadow-[0_0_15px_rgba(181,82,0,0.3),0_0_30px_rgba(181,82,0,0.1)]"
                style={{
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  background: "radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.4) 28%, rgba(236, 227, 218, 1) 100%)",
                }}
              >
                {/* Logo */}
                <Image
                  src="/images/jettoptics-logo.png"
                  alt="JettOptics Logo"
                  width={28}
                  height={28}
                  className="object-contain relative z-10"
                />
              </div>
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {isLogoHovered && (
          <motion.div
            ref={cursorElementRef}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed pointer-events-none z-[100] w-20 h-20 rounded-full overflow-hidden"
          >
            <video
              ref={videoRef}
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/founderanimated%24OPTX-ZDF4UaHG3fbYo8OWNIJWHggfWlVVlv.mp4"
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-lg md:hidden"
          >
            <nav className="flex flex-col items-center justify-center h-full gap-8">
              {navLinks.map((link, index) => (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => scrollToSection(link.href)}
                  className="group relative text-4xl font-sans tracking-tight text-foreground"
                >
                  <span className="text-accent font-mono text-sm mr-2">0{index + 1}</span>
                  {link.label}
                </motion.button>
              ))}

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.3 }}
                className="group relative text-4xl font-sans tracking-tight text-foreground"
              >
                <Link href="/docs" onClick={() => setIsMenuOpen(false)}>
                  Docs
                </Link>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.4 }}
                className="group relative text-4xl font-sans tracking-tight text-foreground"
              >
                <Link href="https://astroknots.space" onClick={() => setIsMenuOpen(false)}>
                  <span className="text-accent mr-2">Δ</span>
                  ASTRO.KNOTS
                </Link>
              </motion.button>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-8"
              >
                <Link href="/loading" className="block">
                  <LiquidMetalCircle
                    size={160}
                    borderWidth={6}
                    repetition={1.5}
                    softness={0.5}
                    shiftRed={0.3}
                    shiftBlue={0.3}
                    distortion={0}
                    contour={0}
                    angle={100}
                    scale={1.5}
                    speed={0.6}
                  >
                    <Image
                      src="/images/jettoptics-logo.png"
                      alt="JettOptics Logo"
                      width={120}
                      height={120}
                      className="object-contain"
                    />
                  </LiquidMetalCircle>
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
