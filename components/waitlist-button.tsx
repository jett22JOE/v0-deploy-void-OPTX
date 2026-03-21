"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowUpRight, Check } from "lucide-react"
import { MatrixText } from "./matrix-text"
import { useRouter } from "next/navigation"

export function WaitlistButton() {
  const [isHovered, setIsHovered] = useState(false)
  const [hasJoinedWaitlist, setHasJoinedWaitlist] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const joined = localStorage.getItem("waitlist_joined") === "true"
    setHasJoinedWaitlist(joined)
  }, [])

  const handleClick = () => {
    if (!hasJoinedWaitlist) {
      router.push("/loading")
    }
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
      <div className="relative py-8 md:py-12 px-8 md:px-12 border-t border-white/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <motion.h2
            className="font-sans text-4xl md:text-6xl lg:text-8xl font-light tracking-tight text-center md:text-left"
            animate={{ color: isHovered ? "#050505" : "#fafafa" }}
            transition={{ duration: 0.3 }}
          >
            <MatrixText text={hasJoinedWaitlist ? "You're On The List" : "Join Waitlist"} speed={40} />
          </motion.h2>
          <motion.div
            animate={{ rotate: isHovered ? 45 : 0, color: isHovered ? "#050505" : "#fafafa" }}
            transition={{ duration: 0.3 }}
          >
            {hasJoinedWaitlist ? (
              <Check className="w-12 h-12 md:w-16 md:h-16" />
            ) : (
              <ArrowUpRight className="w-12 h-12 md:w-16 md:h-16" />
            )}
          </motion.div>
        </div>
      </div>
    </motion.button>
  )
}
