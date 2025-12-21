"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

const techItems = [
  "NEXT.JS",
  "TYPESCRIPT",
  "PYTHON",
  "SWIFT",
  "ARKit",
  "SOLANA",
  "RUST",
  "FASTAPI",
  "MEDIAPIPE",
  "OpenXR",
  "GROK",
  "LIBSODIUM",
]

const concepts = [
  "AGT",
  "HEDGEHOG",
  "DePIN",
  "2-SIMPLEX",
  "MARKOV",
  "POST-Q",
  "TENSOR",
  "COG",
  "EMO",
  "ENV",
  "MCP",
  "E2E",
]

function MarqueeRow({ items, direction = "left" }: { items: string[]; direction?: "left" | "right" }) {
  const duplicatedItems = [...items, ...items, ...items, ...items]

  return (
    <div className="relative overflow-hidden py-4">
      <motion.div
        className={`flex gap-8 ${direction === "left" ? "animate-marquee-left" : "animate-marquee-right"}`}
        style={{ width: "fit-content" }}
      >
        {duplicatedItems.map((item, index) => (
          <span
            key={index}
            className="group font-sans text-5xl md:text-7xl lg:text-8xl font-light tracking-tight whitespace-nowrap cursor-default"
            style={{
              WebkitTextStroke: "1px rgba(255,255,255,0.3)",
              color: "transparent",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "white"
              e.currentTarget.style.WebkitTextStroke = "none"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "transparent"
              e.currentTarget.style.WebkitTextStroke = "1px rgba(255,255,255,0.3)"
            }}
          >
            {item}
            <span className="mx-8 text-white/20">•</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export function TechMarquee() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Load Twitter widget script
    const script = document.createElement("script")
    script.src = "https://platform.twitter.com/widgets.js"
    script.async = true
    script.charset = "utf-8"

    script.onload = () => {
      // Force Twitter to render widgets with dark theme
      if ((window as unknown as { twttr?: { widgets?: { load: () => void } } }).twttr?.widgets) {
        (window as unknown as { twttr: { widgets: { load: () => void } } }).twttr.widgets.load()
      }
    }

    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [mounted])

  return (
    <section className="relative py-24 overflow-hidden md:py-32">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="px-8 md:px-12 mb-16"
      >
        <p className="font-mono text-xs tracking-[0.3em] mb-4 text-accent">Δ — ASTRO.KNOTS</p>
      </motion.div>

      <div className="space-y-4">
        <MarqueeRow items={techItems} direction="left" />
        <MarqueeRow items={concepts} direction="right" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex justify-center px-8 md:px-12 mt-16"
      >
        <div className="max-w-md">
          {mounted && (
            <blockquote className="twitter-tweet" data-theme="dark">
              <p lang="en" dir="ltr">
                Email Waitlist is Live!{" "}
                <a href="https://twitter.com/search?q=%24OPTX&amp;src=ctag&amp;ref_src=twsrc%5Etfw">$OPTX</a>{" "}
                <a href="https://t.co/a6FEG0OFEf">pic.twitter.com/a6FEG0OFEf</a>
              </p>
              &mdash; Jett Optics (@jettoptx){" "}
              <a href="https://twitter.com/jettoptx/status/2002594926337618391?ref_src=twsrc%5Etfw">December 21, 2025</a>
            </blockquote>
          )}
        </div>
      </motion.div>
    </section>
  )
}
