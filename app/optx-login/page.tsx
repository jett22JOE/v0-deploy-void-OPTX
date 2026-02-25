"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SignIn, SignUp } from "@clerk/nextjs"
import { useSafeAuth } from "@/lib/hooks/use-safe-auth"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import nextDynamic from "next/dynamic"
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background"
// AnimatedMetalBorder removed for hydration performance
import { useWallet } from "@solana/wallet-adapter-react"
import { Shield, Eye, Fingerprint, Wallet, Brain, Link2, ChevronRight, ChevronLeft } from "lucide-react"

// Dynamic import for wallet button (SSR-safe)
const WalletMultiButton = nextDynamic(
  () => import("@solana/wallet-adapter-react-ui").then((mod) => mod.WalletMultiButton),
  { ssr: false, loading: () => <div className="h-10 w-40 bg-zinc-800 rounded-lg animate-pulse" /> }
)

/* ─────────────────────────────────────────────────────────
   AGT Tensor Diagram — SVG recreation inspired by Grok Imagine
   R³ simplex with COG/EMO/ENV vertices, saccade arrows,
   transition matrix heatmap, and trefoil knot
   ───────────────────────────────────────────────────────── */
function AGTDiagram({ activeStep }: { activeStep: number }) {
  const cogActive = activeStep === 0 || activeStep === 4 || activeStep === 5
  const walletActive = activeStep === 1
  const mintActive = activeStep === 2
  const knotActive = activeStep === 3
  const gazeActive = activeStep === 4
  const allActive = activeStep === 5

  // Triangle path for draw-on animation
  const triPath = "M160,45 L75,185 L245,185 Z"
  const triLen = 490 // approximate path length

  // Orbital angle for barycentric point
  const baryTargets = [
    { cx: 160, cy: 90 },   // step 0 — near COG
    { cx: 160, cy: 138 },  // step 1 — center (wallet)
    { cx: 160, cy: 138 },  // step 2 — center (mint)
    { cx: 160, cy: 160 },  // step 3 — lower (knot)
    { cx: 130, cy: 138 },  // step 4 — leftish (gaze)
    { cx: 160, cy: 138 },  // step 5 — center (all)
  ]
  const bary = baryTargets[activeStep] || baryTargets[5]

  return (
    <svg viewBox="0 0 320 260" className="w-full max-w-[280px] mx-auto" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="redPlane" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#dc2626" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="cogGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
        <linearGradient id="emoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>
        <linearGradient id="envGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <radialGradient id="baryGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="bigGlow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <marker id="arrowBlue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#3b82f6" />
        </marker>
      </defs>

      {/* R³ Cube wireframe — draws in on mount */}
      <motion.g
        opacity={0.15}
        stroke="#94a3b8"
        strokeWidth="0.5"
        fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 1.5, delay: 0.2 }}
      >
        {["M60,30 L260,30 L280,60 L80,60 Z", "M60,30 L60,180 L80,210 L80,60", "M260,30 L260,180 L280,210 L280,60", "M60,180 L260,180 L280,210 L80,210 Z"].map((d, i) => (
          <motion.path
            key={`cube${i}`}
            d={d}
            strokeDasharray="600"
            initial={{ strokeDashoffset: 600 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1.8, delay: 0.1 * i, ease: "easeOut" }}
          />
        ))}
      </motion.g>

      {/* Dual-space functional plane (red) */}
      <motion.polygon
        points="70,130 270,130 240,170 100,170"
        fill="url(#redPlane)"
        stroke="#dc2626"
        strokeWidth="0.5"
        strokeOpacity="0.3"
        animate={{ opacity: allActive || mintActive ? 1 : 0.5 }}
        transition={{ duration: 0.6 }}
      />
      <g opacity="0.08" stroke="#dc2626" strokeWidth="0.3">
        {[0,1,2,3,4,5].map(i => (
          <line key={`hg${i}`} x1={80+i*32} y1={132} x2={106+i*22} y2={168} />
        ))}
        {[0,1,2,3].map(i => (
          <line key={`vg${i}`} x1={70+i*25} y1={130+i*0.5} x2={240+i*13} y2={130+i*13} />
        ))}
      </g>

      {/* Triangle simplex — draws itself with stroke-dashoffset */}
      <motion.path
        d={triPath}
        fill="none"
        stroke="white"
        strokeLinejoin="round"
        filter="url(#glow)"
        strokeDasharray={triLen}
        initial={{ strokeDashoffset: triLen, strokeWidth: 1 }}
        animate={{
          strokeDashoffset: 0,
          strokeWidth: allActive ? 2.2 : 1.2,
          strokeOpacity: allActive ? 0.95 : 0.6,
        }}
        transition={{ strokeDashoffset: { duration: 2, ease: "easeInOut" }, strokeWidth: { duration: 0.5 }, strokeOpacity: { duration: 0.5 } }}
      />

      {/* Pulsing triangle echo on "All Connected" step */}
      {allActive && (
        <motion.path
          d={triPath}
          fill="none"
          stroke="white"
          strokeLinejoin="round"
          strokeWidth="1"
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.06, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "160px 138px" }}
        />
      )}

      {/* Barycentric point — animates position between steps */}
      <motion.circle
        r={allActive ? 5 : 3.5}
        fill="white"
        filter="url(#glow)"
        animate={{
          cx: bary.cx,
          cy: bary.cy,
          r: allActive ? [4, 6, 4] : [3, 4, 3],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          cx: { duration: 0.8, ease: "easeInOut" },
          cy: { duration: 0.8, ease: "easeInOut" },
          r: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        }}
      />
      {/* Barycentric glow ring */}
      <motion.circle
        r="12"
        fill="none"
        stroke="white"
        strokeWidth="0.5"
        animate={{
          cx: bary.cx,
          cy: bary.cy,
          opacity: [0.15, 0.05, 0.15],
          r: [10, 16, 10],
        }}
        transition={{
          cx: { duration: 0.8, ease: "easeInOut" },
          cy: { duration: 0.8, ease: "easeInOut" },
          opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          r: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Saccade arrows — sequential draw with stagger */}
      <motion.g animate={{ opacity: gazeActive || allActive ? 0.9 : 0.2 }} transition={{ duration: 0.5 }}>
        {[
          { x1: 160, y1: 135, x2: 160, y2: 65, delay: 0 },
          { x1: 157, y1: 140, x2: 95, y2: 175, delay: 0.3 },
          { x1: 163, y1: 140, x2: 225, y2: 175, delay: 0.6 },
        ].map(({ x1, y1, x2, y2, delay }, i) => (
          <motion.line
            key={`sac${i}`}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#3b82f6"
            strokeWidth="1.5"
            markerEnd="url(#arrowBlue)"
            strokeDasharray="80"
            animate={gazeActive
              ? { strokeDashoffset: [80, 0, 0, 80], opacity: [0, 1, 1, 0] }
              : { strokeDashoffset: 0, opacity: 1 }
            }
            transition={gazeActive
              ? { duration: 2, repeat: Infinity, delay, times: [0, 0.3, 0.7, 1] }
              : { duration: 0.5 }
            }
          />
        ))}
      </motion.g>

      {/* COG vertex — yellow to match 1/COG key badge */}
      <g>
        <motion.circle
          cx="160" cy="45" r="6"
          filter="url(#glow)"
          animate={{
            fill: cogActive ? "#eab308" : "#64748b",
            r: cogActive ? [5, 8, 5] : 6,
          }}
          transition={{
            fill: { duration: 0.4 },
            r: cogActive ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.4 },
          }}
        />
        {cogActive && (
          <motion.circle
            cx="160" cy="45" r="12"
            fill="none" stroke="#eab308" strokeWidth="1"
            initial={{ opacity: 0, r: 6 }}
            animate={{ opacity: [0.6, 0], r: [6, 20] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
        <motion.text
          x="160" y="30"
          textAnchor="middle"
          fontSize="11"
          fontFamily="monospace"
          fontWeight="bold"
          animate={{ fill: cogActive ? "#eab308" : "#94a3b8" }}
          transition={{ duration: 0.4 }}
        >COG</motion.text>
      </g>

      {/* EMO vertex */}
      <g>
        <motion.circle
          cx="75" cy="185" r="6"
          filter="url(#glow)"
          animate={{
            fill: gazeActive || allActive ? "#ec4899" : "#64748b",
            r: (gazeActive || allActive) ? [5, 8, 5] : 6,
          }}
          transition={{
            fill: { duration: 0.4 },
            r: (gazeActive || allActive) ? { duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 } : { duration: 0.4 },
          }}
        />
        {(gazeActive || allActive) && (
          <motion.circle
            cx="75" cy="185" r="12"
            fill="none" stroke="#ec4899" strokeWidth="1"
            initial={{ opacity: 0, r: 6 }}
            animate={{ opacity: [0.6, 0], r: [6, 20] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
        )}
        <motion.text
          x="55" y="202"
          textAnchor="middle"
          fontSize="11"
          fontFamily="monospace"
          fontWeight="bold"
          animate={{ fill: (gazeActive || allActive) ? "#ec4899" : "#94a3b8" }}
          transition={{ duration: 0.4 }}
        >EMO</motion.text>
      </g>

      {/* ENV vertex */}
      <g>
        <motion.circle
          cx="245" cy="185" r="6"
          filter="url(#glow)"
          animate={{
            fill: gazeActive || allActive ? "#3b82f6" : "#64748b",
            r: (gazeActive || allActive) ? [5, 8, 5] : 6,
          }}
          transition={{
            fill: { duration: 0.4 },
            r: (gazeActive || allActive) ? { duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 } : { duration: 0.4 },
          }}
        />
        {(gazeActive || allActive) && (
          <motion.circle
            cx="245" cy="185" r="12"
            fill="none" stroke="#3b82f6" strokeWidth="1"
            initial={{ opacity: 0, r: 6 }}
            animate={{ opacity: [0.6, 0], r: [6, 20] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
          />
        )}
        <motion.text
          x="265" y="202"
          textAnchor="middle"
          fontSize="11"
          fontFamily="monospace"
          fontWeight="bold"
          animate={{ fill: (gazeActive || allActive) ? "#3b82f6" : "#94a3b8" }}
          transition={{ duration: 0.4 }}
        >ENV</motion.text>
      </g>

      {/* R³ label */}
      <text x="290" y="25" fill="#94a3b8" fontSize="14" fontFamily="serif" fontWeight="bold" opacity="0.5">
        R<tspan baselineShift="super" fontSize="9">3</tspan>
      </text>

      {/* Transition matrix heatmap (bottom-left) — fades in per step */}
      <motion.g
        transform="translate(15, 215)"
        animate={{ opacity: knotActive || allActive ? 0.9 : 0.25 }}
        transition={{ duration: 0.6 }}
      >
        {[0,1,2,3,4,5,6].map((row) =>
          [0,1,2,3,4,5,6,7,8].map((col) => {
            const val = Math.abs(Math.sin(row * 3 + col * 2) * 0.8 + Math.cos(row + col * 5) * 0.2)
            const r = Math.round(20 + val * 200)
            const g = Math.round(40 + (1 - val) * 120)
            const b = Math.round(80 + (1 - val) * 150)
            return (
              <motion.rect
                key={`hm${row}${col}`}
                x={col * 11} y={row * 5}
                width="10" height="4"
                fill={`rgb(${r},${g},${b})`}
                rx="0.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: (row * 9 + col) * 0.008 }}
              />
            )
          })
        )}
        <text x="0" y="-3" fill="#64748b" fontSize="6" fontFamily="monospace">27x27 transition</text>
      </motion.g>

      {/* Trefoil knot (bottom-right) — rotates when active */}
      <motion.g
        transform="translate(230, 218)"
        animate={{ opacity: knotActive || allActive ? 0.9 : 0.25 }}
        transition={{ duration: 0.6 }}
      >
        <motion.g
          fill="none"
          stroke="#94a3b8"
          strokeWidth="1.2"
          opacity="0.7"
          animate={knotActive ? { rotate: [0, 360] } : { rotate: 0 }}
          transition={knotActive ? { duration: 8, repeat: Infinity, ease: "linear" } : { duration: 0.5 }}
          style={{ transformOrigin: "21px 18px" }}
        >
          <ellipse cx="20" cy="12" rx="14" ry="10" transform="rotate(-30, 20, 12)" />
          <ellipse cx="32" cy="22" rx="14" ry="10" transform="rotate(30, 32, 22)" />
          <ellipse cx="10" cy="22" rx="14" ry="10" transform="rotate(90, 10, 22)" />
        </motion.g>
        <text x="21" y="38" textAnchor="middle" fill="#64748b" fontSize="5.5" fontFamily="serif" fontStyle="italic">
          LTx = Jones / Alexander
        </text>
      </motion.g>

      {/* Wallet dashed orbit when wallet step active */}
      {walletActive && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <motion.circle
            cx="160" cy="138" r="35"
            fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="6 4"
            animate={{ strokeDashoffset: [0, -40] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.circle
            cx="160" cy="103" r="3"
            fill="#a855f7" filter="url(#glow)"
            animate={{
              cx: [160, 195, 160, 125, 160],
              cy: [103, 138, 173, 138, 103],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </motion.g>
      )}

      {/* Mint energy burst when mint step active */}
      {mintActive && (
        <motion.g>
          {[0, 60, 120, 180, 240, 300].map((angle, i) => {
            const rad = (angle * Math.PI) / 180
            const x2 = 160 + Math.cos(rad) * 50
            const y2 = 138 + Math.sin(rad) * 50
            return (
              <motion.line
                key={`ray${i}`}
                x1="160" y1="138" x2={x2} y2={y2}
                stroke="#06b6d4" strokeWidth="0.8"
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ opacity: [0, 0.6, 0], pathLength: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
              />
            )
          })}
        </motion.g>
      )}
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────
   JETT Auth Interactive Stepper Modal
   6 steps, tap/click through each one
   ───────────────────────────────────────────────────────── */
const STEPS = [
  {
    icon: Shield,
    title: "Choose Your Gaze PIN",
    description: "Pick a 4–6 position gaze pattern. This becomes your biometric password — unique to the way your eyes move through R³ space.",
    detail: "Your gaze becomes the key.",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
  },
  {
    icon: Wallet,
    title: "Link Your Wallet",
    description: "Your PIN binds to a read-only wallet signature. No funds are ever moved — it's a cryptographic proof of identity, not a transaction.",
    detail: "Quantum-resistant. Hands-free.",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
  },
  {
    icon: Brain,
    title: "Mint Your Agent Twin",
    description: "We create your personal neuromorphic model — an \"Average Joe Twin\" that learns your gaze patterns. Pick a username for your agent.",
    detail: "Tensors that adapt. Patterns that authenticate.",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
  },
  {
    icon: Fingerprint,
    title: "Genesis Signature",
    description: "Your first gaze pattern becomes your seed phrase — changeable later on the OPTX network. Costs 1 JTX staked for your Seed Vault.",
    detail: "Every fixation, proof-of-you.",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
  },
  {
    icon: Eye,
    title: "Camera + Keys",
    description: "Camera stays on — real eyes only. Use keys to calibrate your tensor space:",
    detail: "Cognitive. Emotional. Environmental.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    keys: true,
  },
  {
    icon: Link2,
    title: "All Connected",
    description: "Your gaze knot links to your Clerk account, Convex DB, and wallet. Three vectors, infinite knots — your identity is now spatial.",
    detail: "Trust that evolves.",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
  },
]

function JettAuthModal({ onDismiss }: { onDismiss: () => void }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1

  const next = useCallback(() => {
    if (isLast) { onDismiss(); return }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }, [isLast, onDismiss])

  const prev = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0))
  }, [])

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") { e.preventDefault(); next() }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev() }
      if (e.key === "Escape") onDismiss()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [next, prev, onDismiss])

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[300] p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative bg-zinc-950/90 border border-zinc-800/80 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl shadow-black/50"
      >
        {/* Subtle gradient top bar */}
        <div className="h-[2px] w-full bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500" />

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 pt-5 pb-2">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-orange-500" : i < step ? "w-1.5 bg-orange-500/50" : "w-1.5 bg-zinc-700"
              }`}
            />
          ))}
        </div>

        {/* Step counter */}
        <p className="text-center font-mono text-[10px] text-zinc-600 tracking-widest uppercase">
          Step {step + 1} of {STEPS.length}
        </p>

        {/* Content area */}
        <div className="px-6 md:px-8 pb-6 pt-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center text-center"
            >
              {/* Diagram — responsive, above step content */}
              <div className="mb-4 w-full">
                <AGTDiagram activeStep={step} />
              </div>

              {/* Icon badge */}
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${current.bgColor} border ${current.borderColor} mb-3`}>
                <Icon className={`w-5 h-5 ${current.color}`} />
              </div>

              {/* Title */}
              <h2 className="text-lg md:text-xl font-semibold text-white mb-2 tracking-tight" style={{ fontFamily: "var(--font-orbitron), sans-serif" }}>
                {current.title}
              </h2>

              {/* Description — orange mono, larger than quote */}
              <p className="text-sm md:text-[15px] font-mono text-orange-400 leading-relaxed max-w-sm">
                {current.description}
              </p>

              {/* Key hints for step 5 */}
              {current.keys && (
                <div className="flex gap-3 mt-3">
                  {[
                    { key: "1", label: "COG", color: "border-yellow-500/40 text-yellow-400" },
                    { key: "2", label: "EMO", color: "border-pink-500/40 text-pink-400" },
                    { key: "3", label: "ENV", color: "border-blue-500/40 text-blue-400" },
                  ].map(({ key, label, color }) => (
                    <div key={key} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border bg-zinc-900/50 ${color}`}>
                      <kbd className="text-xs font-mono font-bold">{key}</kbd>
                      <span className="text-[10px] font-mono opacity-70">{label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Accent quote */}
              <p className="mt-3 text-xs font-mono italic text-zinc-600">
                &ldquo;{current.detail}&rdquo;
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-5 gap-3">
            <button
              onClick={prev}
              disabled={step === 0}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-mono text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all disabled:opacity-0 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>

            <button
              onClick={next}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-mono text-sm font-medium transition-all duration-200 ${
                isLast
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/20"
                  : "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
              }`}
            >
              {isLast ? "Begin" : "Next"}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Skip link */}
          <div className="text-center mt-3">
            <button onClick={onDismiss} className="text-[10px] font-mono text-zinc-600 hover:text-zinc-400 transition-colors underline underline-offset-2">
              skip intro
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function OptxLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isSignedIn, isLoaded } = useSafeAuth()
  const { publicKey, connected } = useWallet()

  // JETT Auth modal state
  const [showJettModal, setShowJettModal] = useState(true)

  // Check if we should show signup tab by default
  const defaultTab = searchParams.get("tab") || "signin"
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(
    defaultTab === "signup" ? "signup" : "signin"
  )

  // Timeout fallback — if Clerk never loads after 8s, show the form anyway
  const [forceShow, setForceShow] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoaded) setForceShow(true)
    }, 8000)
    return () => clearTimeout(timer)
  }, [isLoaded])

  // Admin wallets — redirect to vault/dojo on wallet-only connect
  const ADMIN_WALLETS = [
    "FEUwuvXbbSYTCEhhqgAt2viTsEnromNNDsapoFvyfy3H", // founder wallet
    "EFvgELE1Hb4PC5tbPTAe8v1uEDGee8nwYBMCU42bZRGk", // jettoptx.skr / JOE agent wallet
  ]

  // Redirect to DOJO if already signed in (Clerk)
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dojo")
    }
  }, [isLoaded, isSignedIn, router])

  // Redirect admin wallets to vault after Phantom connects (no Clerk needed)
  useEffect(() => {
    if (connected && publicKey) {
      const walletAddr = publicKey.toBase58()
      if (ADMIN_WALLETS.includes(walletAddr)) {
        router.push("/vault")
      } else if (isSignedIn) {
        // Non-admin wallet + Clerk signed in → gaze verify flow
        router.push("/gaze-verify")
      }
    }
  }, [connected, publicKey, isSignedIn, router])

  // Show loading state while Clerk initializes (with timeout escape)
  if ((!isLoaded && !forceShow) || isSignedIn) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
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
        />
        <div className="text-center z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto mb-4" />
          <p className="font-mono text-sm text-white/60">
            {isSignedIn ? "Redirecting to DOJO..." : "Loading..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-y-auto">
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
      />

      {/* JETT Auth modal */}
      {showJettModal && <JettAuthModal onDismiss={() => setShowJettModal(false)} />}

      {/* Logo and back link */}
      <Link href="/" className="absolute top-6 left-6 z-20 group flex items-center gap-2">
        <div className="relative w-8 h-8 flex items-center justify-center">
          <span className="relative flex h-full w-full">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
            <Image
              src="/images/astroknots-logo.png"
              alt="OPTX Logo"
              width={32}
              height={32}
              className="relative inline-flex rounded-full object-contain"
            />
          </span>
        </div>
        <span className="font-mono text-xs tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
          OPTX
        </span>
      </Link>

      {/* Wallet connect + status — top right */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <div className={`px-3 py-1 rounded-full font-mono text-[10px] ${
          connected
            ? "bg-green-500/20 text-green-400 border border-green-500/30"
            : "bg-zinc-800/80 text-zinc-500 border border-zinc-700"
        }`}>
          {publicKey ? `${publicKey.toBase58().slice(0, 6)}...${publicKey.toBase58().slice(-4)}` : "No Wallet"}
        </div>
        <WalletMultiButton className="!bg-[#b55200] hover:!bg-[#8a3f00] !text-white !font-mono !text-xs !px-4 !py-2 !rounded-lg !border !border-orange-500/30 !h-auto !transition-colors" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="relative z-[200] flex flex-col items-center justify-center p-4 w-full max-w-md"
        >
          {/* Tab switcher */}
          <div className="flex mb-4 bg-zinc-900/80 rounded-lg p-1 border border-zinc-800">
            <button
              onClick={() => setActiveTab("signin")}
              className={`px-6 py-2 rounded-md font-mono text-xs tracking-wider transition-all duration-200 ${
                activeTab === "signin"
                  ? "bg-accent text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              SIGN IN
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`px-6 py-2 rounded-md font-mono text-xs tracking-wider transition-all duration-200 ${
                activeTab === "signup"
                  ? "bg-accent text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              SIGN UP
            </button>
          </div>

          <div className="rounded-2xl w-full border border-zinc-800/60 bg-zinc-950/40 backdrop-blur-sm shadow-xl shadow-black/30">
            <div className="clerk-auth-wrapper rounded-2xl w-full">
              {/* CSS overrides for Clerk components */}
              <style jsx global>{`
                .clerk-auth-wrapper .cl-rootBox,
                .clerk-auth-wrapper .cl-card,
                .clerk-auth-wrapper .cl-headerTitle,
                .clerk-auth-wrapper .cl-headerSubtitle,
                .clerk-auth-wrapper .cl-formFieldLabel,
                .clerk-auth-wrapper .cl-formFieldInput,
                .clerk-auth-wrapper .cl-formButtonPrimary,
                .clerk-auth-wrapper .cl-footerActionText,
                .clerk-auth-wrapper .cl-footerActionLink,
                .clerk-auth-wrapper * {
                  font-family: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace !important;
                }
                .clerk-auth-wrapper {
                  max-height: 80vh;
                  overflow-y: auto;
                  scrollbar-width: thin;
                  scrollbar-color: rgba(181, 82, 0, 0.5) transparent;
                }
                .clerk-auth-wrapper::-webkit-scrollbar { width: 6px; }
                .clerk-auth-wrapper::-webkit-scrollbar-track { background: transparent; }
                .clerk-auth-wrapper::-webkit-scrollbar-thumb { background: rgba(181, 82, 0, 0.5); border-radius: 3px; }
                .clerk-auth-wrapper .cl-card { padding-top: 1.5rem !important; }
                .clerk-auth-wrapper .cl-footer { display: none !important; }
                @media (max-width: 640px) {
                  .clerk-auth-wrapper { max-height: 75vh; width: 100%; }
                  .clerk-auth-wrapper .cl-formFieldInput, .clerk-auth-wrapper input { font-size: 16px !important; }
                }
              `}</style>

              {activeTab === "signin" ? (
                <SignIn
                  forceRedirectUrl="/gaze-verify"
                  signUpUrl="/optx-login?tab=signup"
                  appearance={{
                    variables: {
                      colorPrimary: "#b55200",
                      colorText: "#1a1a1a",
                      colorTextSecondary: "#555555",
                      colorBackground: "#ffffff",
                      colorInputBackground: "#f4f4f5",
                      colorInputText: "#1a1a1a",
                      borderRadius: "0.5rem",
                    },
                    elements: {
                      rootBox: "w-full",
                      card: "bg-white shadow-none border-0 backdrop-blur-xl",
                      headerTitle: "font-mono text-zinc-900",
                      headerSubtitle: "font-mono text-sm text-zinc-500",
                      formFieldLabel: "font-mono text-xs text-zinc-600",
                      formFieldInput: "font-mono text-sm bg-zinc-100 border-zinc-300 text-zinc-900 placeholder:text-zinc-400",
                      formButtonPrimary: "font-mono bg-accent hover:bg-accent/90 text-white",
                      footerActionLink: "text-accent hover:text-accent/80",
                      socialButtonsBlockButton: "font-mono border-zinc-300 hover:bg-zinc-100 text-zinc-900",
                      socialButtonsBlockButtonText: "font-mono text-sm text-zinc-900",
                      dividerLine: "bg-zinc-300",
                      dividerText: "font-mono text-xs text-zinc-500",
                      identityPreviewText: "font-mono text-zinc-900",
                      identityPreviewEditButton: "text-accent",
                      formFieldSuccessText: "text-green-600",
                      formFieldErrorText: "text-red-500",
                      alertText: "font-mono text-sm",
                      otpCodeFieldInput: "font-mono bg-zinc-100 border-zinc-300 text-zinc-900",
                    }
                  }}
                />
              ) : (
                <SignUp
                  forceRedirectUrl="/gaze-verify"
                  signInUrl="/optx-login?tab=signin"
                  appearance={{
                    variables: {
                      colorPrimary: "#b55200",
                      colorText: "#1a1a1a",
                      colorTextSecondary: "#555555",
                      colorBackground: "#ffffff",
                      colorInputBackground: "#f4f4f5",
                      colorInputText: "#1a1a1a",
                      borderRadius: "0.5rem",
                    },
                    elements: {
                      rootBox: "w-full",
                      card: "bg-white shadow-none border-0 backdrop-blur-xl",
                      headerTitle: "font-mono text-zinc-900",
                      headerSubtitle: "font-mono text-sm text-zinc-500",
                      formFieldLabel: "font-mono text-xs text-zinc-600",
                      formFieldInput: "font-mono text-sm bg-zinc-100 border-zinc-300 text-zinc-900 placeholder:text-zinc-400",
                      formButtonPrimary: "font-mono bg-accent hover:bg-accent/90 text-white",
                      footerActionLink: "text-accent hover:text-accent/80",
                      socialButtonsBlockButton: "font-mono border-zinc-300 hover:bg-zinc-100 text-zinc-900",
                      socialButtonsBlockButtonText: "font-mono text-sm text-zinc-900",
                      dividerLine: "bg-zinc-300",
                      dividerText: "font-mono text-xs text-zinc-500",
                      identityPreviewText: "font-mono text-zinc-900",
                      identityPreviewEditButton: "text-accent",
                      formFieldSuccessText: "text-green-600",
                      formFieldErrorText: "text-red-500",
                      alertText: "font-mono text-sm",
                      otpCodeFieldInput: "font-mono bg-zinc-100 border-zinc-300 text-zinc-900",
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Gaze verify link — after Clerk auth, go to gaze pattern */}
          <div className="mt-4 text-center">
            <Link
              href="/gaze-verify"
              className="font-mono text-xs text-orange-400/60 hover:text-orange-400 transition-colors underline underline-offset-4"
            >
              Skip to Gaze Verification →
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-[6]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
