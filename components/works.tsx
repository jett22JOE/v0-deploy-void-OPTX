"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion"
import { MatrixText } from "./matrix-text"

const AARONHoverText = ({ isHovered }: { isHovered: boolean }) => {
  const [displayText, setDisplayText] = useState("AARON Protocol")
  const fullText = "Asynchronous Audit RAG Optical Node"

  useState(() => {
    if (isHovered) {
      let currentIndex = 0
      const interval = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setDisplayText(fullText.slice(0, currentIndex))
          currentIndex++
        } else {
          clearInterval(interval)
        }
      }, 50)
      return () => clearInterval(interval)
    } else {
      setDisplayText("AARON Protocol")
    }
  })

  if (displayText === "AARON Protocol") {
    return (
      <span>
        <span className="bg-gradient-to-r from-accent via-orange-500 to-accent bg-clip-text text-transparent font-medium">
          AARON
        </span>{" "}
        Protocol
      </span>
    )
  }

  return <span>{displayText}</span>
}

const projects = [
  {
    title: "AGT Auth",
    displayTitle: (
      <>
        <span className="text-accent">AGT</span> Auth
      </>
    ),
    tags: ["ARKit", "MediaPipe", "OpenXR", "Post-Q"],
    image: "/abstract-neural-network-visualization-dark-theme.jpg",
    scope: "MOJO",
    description:
      "Mobile Jett Optics—native gaze authentication powered by Adaptive Gaze Tensors. AGTs classify your eye movements into cognitive, emotional, and environmental vectors on a 2-simplex, creating a biometric signature that evolves with you. Hands-free, spoof-proof, quantum-resistant via our Joule Encryption Temporal Template.",
  },
  {
    title: "Jett-Chat",
    displayTitle: (
      <>
        <span className="text-accent">Jett</span>-Chat
      </>
    ),
    tags: ["BitChat", "WebSocket", "$OPTX", "ZeroMQ"], // Verified ZeroMQ appears only once in tags array
    image: "/images/jett-chat-mojo.jpg",
    largeHoverWindow: true,
    scope: "DePIN",
    description:
      "End-to-end encrypted messaging secured by your unique gaze signature. Every message you send contributes to the network, earning $OPTX tokens through proof-of-engagement. Your attention becomes value—no keystrokes, no surveillance, just optical authentication that rewards participation in the decentralized communication layer.",
  },
  {
    title: "AARON Protocol",
    useHoverAnimation: true,
    tags: ["Rust", "Anchor", "Solana", "astro.knots"],
    image: "/sound-wave-visualization-dark-theme.jpg",
    scope: "On-Chain",
    description:
      "Asynchronous Audit RAG Optical Node - A decentralized protocol built on Solana that enables trustless verification of optical encryption signatures. AARON leverages retrieval-augmented generation to audit and validate cryptographic operations across distributed networks.",
  },
  {
    title: "Agent",
    displayTitle: (
      <>
        <span className="bg-gradient-to-r from-accent via-orange-500 to-accent bg-clip-text text-transparent font-medium">
          J
        </span>{" "}
        <span className="bg-gradient-to-r from-accent via-orange-500 to-accent bg-clip-text text-transparent font-medium">
          O
        </span>{" "}
        <span className="bg-gradient-to-r from-accent via-orange-500 to-accent bg-clip-text text-transparent font-medium">
          E
        </span>{" "}
        Agent
      </>
    ),
    tags: ["FastAPI", "HEDGEHOG", "𝕏AI", "Python"],
    image: "/images/joe-agent-cowboy.png",
    largeHoverWindow: true,
    scope: "AI",
    description:
      "Meet HEDGEHOG: Handshake Encrypted Delegated Gesture Envelope Handler Optical Gateway. The MCP orchestration layer that transforms XR gestures into encrypted intelligence—bridging your gaze, AI reasoning, and quantum-resistant key generation in real-time.",
  },
  {
    title: "Neuromorphic Applications",
    displayTitle: (
      <>
        <span className="text-accent font-normal">Neuro</span>morphic{" "}
        <span className="text-accent font-normal">App</span>lications
      </>
    ),
    tags: ["pSNN", "TensorFlow.js", "OpenXR", "AGT"],
    image: "/images/neuro-apps.jpeg",
    scope: "jOSH", // updated scope to "jOSH"
    description:
      "Next-generation computing applications inspired by the human brain's neural architecture. This initiative explores how neuromorphic chips can process gaze vectors and optical data with unprecedented efficiency, enabling real-time spatial encryption at the edge. Joe_Operating_System_Hedgehog | Agentic Computing.",
  },
]

export function Works() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      mouseX.set(e.clientX - rect.left)
      mouseY.set(e.clientY - rect.top)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current && e.touches.length > 0) {
      const rect = containerRef.current.getBoundingClientRect()
      const touch = e.touches[0]
      mouseX.set(touch.clientX - rect.left)
      mouseY.set(touch.clientY - rect.top)
    }
  }

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <>
      <section id="spatial-encryption" className="relative py-12 px-8 md:px-12 md:py-24">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12 md:mb-24"
        >
          <p className="font-mono text-xs tracking-[0.3em] mb-4 text-accent">01 — Spatial Encryption </p>
          <h2 className="font-sans text-3xl md:text-5xl font-light italic">
            <MatrixText text="Evolutionary Web3 Optics for Artificial Spaces" speed={30} />
          </h2>
        </motion.div>

        {/* Projects List */}
        <div ref={containerRef} onMouseMove={handleMouseMove} onTouchStart={handleTouchStart} className="relative">
          {projects.map((project, index) => {
            // Insert Overview Section before JOE Agent (index 3)
            const isJoeAgentIndex = index === 3
            return (
              <div key={project.title}>
                {isJoeAgentIndex && (
                  <motion.div
                    id="joe-agent"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl py-12 md:py-24 border-t border-white/10"
                  >
                    <p className="font-mono text-xs tracking-[0.3em] text-accent mb-6">OVERVIEW - JOE AI </p>
                    <h2 className="font-sans text-4xl md:text-6xl lg:text-7xl font-light tracking-tight mb-8 text-white leading-[1.15]">
                      <MatrixText text="Building the Future of" speed={30} />
                      <br />
                      <span className="italic text-orange-500">
                        <MatrixText text="Spatial Security" speed={30} />
                      </span>
                    </h2>
                    <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
                      A collection of cutting-edge projects exploring the intersection of cryptography, computer vision, and
                      decentralized systems. Each initiative pushes the boundaries of spatial authentication and optical
                      encryption technologies.
                    </p>
                  </motion.div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="relative border-t border-white/10 py-6 md:py-12"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onTouchStart={(e) => {
                    handleTouchStart(e)
                    setHoveredIndex(index)
                  }}
                  onTouchEnd={() => {
                    // Delay hiding so user can see the image
                    setTimeout(() => setHoveredIndex(null), 1500)
                  }}
                >
              <div
                data-cursor-hover
                className="group flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                onClick={() => toggleExpand(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && toggleExpand(index)}
                aria-expanded={expandedIndex === index}
              >
                <div className="flex flex-row md:flex-col items-center md:items-start gap-2 order-1 md:order-none md:min-w-[80px]">
                  <span className="font-mono text-xs tracking-widest text-accent">{project.scope}</span>
                  <motion.span
                    className="text-accent text-xl md:text-2xl leading-none"
                    animate={{ rotate: expandedIndex === index ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    +
                  </motion.span>
                </div>

                <motion.h3
                  className="font-sans text-4xl md:text-6xl lg:text-7xl font-light tracking-tight group-hover:text-white/70 transition-colors duration-300 flex-1"
                  animate={{
                    x: hoveredIndex === index ? 20 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {"useHoverAnimation" in project ? (
                    <AARONHoverText isHovered={hoveredIndex === index} />
                  ) : "displayTitle" in project ? (
                    project.displayTitle
                  ) : (
                    project.title
                  )}
                </motion.h3>

                {/* Tags */}
                <div className="flex gap-2 flex-wrap order-2 md:order-none">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[10px] tracking-wider px-3 py-1 border border-white/20 rounded-full text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Expandable Description Section */}
              <AnimatePresence>
                {expandedIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 md:pt-8 md:pl-24 max-w-3xl">
                      <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
                </motion.div>
              </div>
            )
          })}

          {/* Floating Image */}
          <motion.div
            className={`absolute pointer-events-none z-50 overflow-hidden rounded-lg ${
              hoveredIndex !== null && projects[hoveredIndex].largeHoverWindow
                ? "w-32 h-64 md:w-56 md:h-[28rem]"
                : "w-40 h-28 md:w-72 md:h-44"
            }`}
            style={{
              left: springX,
              top: springY,
              boxShadow:
                hoveredIndex !== null
                  ? "0 0 20px rgba(181, 82, 0, 0.5), 0 0 40px rgba(181, 82, 0, 0.3), inset 0 0 20px rgba(181, 82, 0, 0.1)"
                  : "none",
              border: hoveredIndex !== null ? "1px solid rgba(181, 82, 0, 0.6)" : "none",
            }}
            animate={{
              opacity: hoveredIndex !== null ? 1 : 0,
              scale: hoveredIndex !== null ? 0.85 : 0.8,
              x: "-50%",
              y: 20,
            }}
            transition={{ duration: 0.2 }}
          >
            {hoveredIndex !== null && (
              <motion.img
                src={projects[hoveredIndex].image}
                alt={projects[hoveredIndex].title}
                className="w-full h-full object-cover"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4 }}
                style={{
                  filter: "grayscale(50%) contrast(1.1)",
                }}
              />
            )}
            {/* Glitch overlay */}
            <div className="absolute inset-0 mix-blend-overlay bg-gradient-to-b from-accent/20 via-transparent to-accent/20" />
          </motion.div>
        </div>

        {/* Bottom Border */}
        <div className="border-t border-white/10 mt-12 md:mt-24" />
      </section>
    </>
  )
}
