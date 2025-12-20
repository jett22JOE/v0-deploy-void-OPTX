"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { MatrixText } from "./matrix-text"
import { useRouter } from "next/navigation"

export function WaitlistButton() {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()

  const handleClick = () => {
    router.push("/loading")
  }

  return (
    <motion.button
      data-cursor-hover
      className="relative block overflow-hidden w-full text-left"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <motion.div
        className="absolute inset-0 bg-accent"
        initial={{ y: "100%" }}
        animate={{ y: isHovered ? "0%" : "100%" }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
      <div className="relative py-16 md:py-24 px-8 md:px-12 border-t border-white/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <motion.h2
            className="font-sans text-4xl md:text-6xl lg:text-8xl font-light tracking-tight text-center md:text-left"
            animate={{ color: isHovered ? "#050505" : "#fafafa" }}
            transition={{ duration: 0.3 }}
          >
            <MatrixText text="Join Waitlist" speed={40} />
          </motion.h2>
          <motion.div
            animate={{ rotate: isHovered ? 45 : 0, color: isHovered ? "#050505" : "#fafafa" }}
            transition={{ duration: 0.3 }}
          >
            <ArrowUpRight className="w-12 h-12 md:w-16 md:h-16" />
          </motion.div>
        </div>
      </div>
    </motion.button>
  )
}
