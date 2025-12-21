"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useScroll, useTransform, useSpring, useMotionValue, useAnimationFrame } from "framer-motion"
import { MatrixText } from "./matrix-text"

const statements = [
  "Your gaze becomes the key. Your attention becomes value.",
  "Cognitive. Emotional. Environmental. Three vectors, infinite knots.",
  "Tensors that adapt. Patterns that authenticate. Trust that evolves.",
  "Every interaction is an encryption. Every fixation, proof-of-you.",
  "Quantum-resistant. Hands-free. Inevitable.",
  "Achieving the singularity of the human iris.",
]

export function About() {
  const containerRef = useRef<HTMLElement>(null)
  const [scrollDirection, setScrollDirection] = useState<"down" | "up">("down")
  const lastScrollY = useRef(0)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY.current) {
        setScrollDirection("down")
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection("up")
      }
      lastScrollY.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const autoScrollX = useMotionValue(0)
  const scrollSpeed = 2.0

  useAnimationFrame((t, delta) => {
    const direction = scrollDirection === "down" ? -1 : 1
    const current = autoScrollX.get()
    autoScrollX.set(current + direction * scrollSpeed)
  })

  const scrollBasedX = useTransform(scrollYProgress, [0, 1], [0, -1000])
  const combinedX = useMotionValue(0)

  useEffect(() => {
    const unsubscribe = scrollBasedX.on("change", (latest) => {
      combinedX.set(latest + autoScrollX.get())
    })

    const unsubscribeAuto = autoScrollX.on("change", (latest) => {
      combinedX.set(scrollBasedX.get() + latest)
    })

    return () => {
      unsubscribe()
      unsubscribeAuto()
    }
  }, [scrollBasedX, autoScrollX, combinedX])

  const smoothX = useSpring(combinedX, { stiffness: 100, damping: 30 })

  return (
    <section ref={containerRef} className="relative py-12 overflow-hidden md:py-0">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="px-8 md:px-12 mb-0 py-12 md:py-20"
      >
        <p className="font-mono text-xs tracking-[0.3em] mb-4 text-accent">S0L3 — EVOLVE </p>
        <h2 className="font-sans text-3xl md:text-5xl font-light italic">
          <MatrixText text="TYPE WITH YOUR EYES" className="text-white" />
        </h2>
      </motion.div>

      {/* Horizontal Scroll Container */}
      <div className="relative flex items-center overflow-hidden py-4 md:py-8 gap-0 h-24 md:h-32">
        <motion.div style={{ x: smoothX }} className="flex gap-16 md:gap-24 px-8 md:px-12 whitespace-nowrap">
          {statements.map((statement, index) => (
            <motion.p
              key={index}
              className={`text-4xl md:text-6xl lg:text-7xl font-sans font-light tracking-tight ${
                statement === "Adaptive Gaze Tensors" ? "text-accent" : "text-white/90"
              }`}
              style={{
                WebkitTextStroke: index % 2 === 0 ? "none" : "1px rgba(255,255,255,0.3)",
                color: index % 2 === 0 ? "inherit" : "transparent",
              }}
            >
              {statement}
            </motion.p>
          ))}
        </motion.div>
      </div>

      {/* Decorative Line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mt-8 md:mt-16 mx-8 md:mx-12 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent origin-left"
      />
    </section>
  )
}
