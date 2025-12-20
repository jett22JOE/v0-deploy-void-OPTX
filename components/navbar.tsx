"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? "bg-background/80 backdrop-blur-md border-b border-border" : ""
        }`}
      >
        <nav className="flex items-center justify-between px-6 py-6 md:px-12 md:py-5">
          {/* Left: DAPP Branding */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
            className="group flex items-center gap-2"
          >
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
            <span className="font-mono text-xs tracking-widest text-muted-foreground">DAPP</span>
          </a>

          {/* Center: Navigation Links (Desktop only, visible inline) */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <li key={link.label}>
                <button
                  onClick={() => scrollToSection(link.href)}
                  className="group relative font-mono text-xs tracking-wider text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  <span className="text-accent mr-1">0{index + 1}</span>
                  {link.label.toUpperCase()}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-foreground group-hover:w-full transition-all duration-300" />
                </button>
              </li>
            ))}
          </ul>

          {/* Right: Logo Button */}
          <div className="relative">
            {/* Desktop Logo Button */}
            <div className="hidden md:block">
              <Link
                href="/loading"
                onMouseEnter={() => setIsLogoHovered(true)}
                onMouseLeave={() => setIsLogoHovered(false)}
                onMouseMove={handleMouseMove}
                className="flex items-center gap-3 group relative px-3 py-2"
                style={{ cursor: isLogoHovered ? "none" : "pointer" }}
              >
                <div
                  className={`relative w-12 h-12 overflow-hidden rounded-lg flex items-center justify-center bg-transparent transition-all duration-200 ${
                    isLogoHovered ? "border-transparent" : "border border-accent/40"
                  }`}
                >
                  {/* Static Logo - always visible now */}
                  <div className="absolute inset-0 flex items-center justify-center z-10 p-1">
                    <Image
                      src="/images/jettoptics-logo.png"
                      alt="JettOptics Logo"
                      width={36}
                      height={36}
                      className="object-contain"
                    />
                  </div>
                </div>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden relative p-2"
              aria-label="Toggle menu"
            >
              <div className="absolute inset-0 -m-1 bg-gradient-to-br from-accent/20 via-orange-500/10 to-accent/20 rounded-lg blur-sm" />
              <div className="relative w-12 h-12 rounded-lg backdrop-blur-sm p-2 border border-accent/40 flex items-center justify-center">
                <Image
                  src="/images/jettoptics-logo.png"
                  alt="JettOptics Logo"
                  width={36}
                  height={36}
                  className="object-contain"
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

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-8"
              >
                <Link href="/loading" className="relative w-40 h-40 rounded-lg block">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/30 via-orange-500/20 to-accent/30 rounded-lg blur-sm" />
                  <div className="relative w-full h-full rounded-lg backdrop-blur-sm border border-accent/40 flex items-center justify-center p-3">
                    <Image
                      src="/images/jettoptics-logo.png"
                      alt="JettOptics Logo"
                      width={128}
                      height={128}
                      className="object-contain"
                    />
                  </div>
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
