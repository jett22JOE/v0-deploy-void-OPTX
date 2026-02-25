"use client"

import { useState, useEffect, useRef } from "react"
import { BrainCircuit, Eye, ScanLine, Zap, Network, Copy, Check, ChevronRight } from "lucide-react"
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background"

const augments = [
  {
    id: "neuromorphic",
    title: "Neuromorphic Augments",
    icon: BrainCircuit,
    sections: ["What Are Neuromorphic Augments?", "How the DOJO Trains Augmentation", "Spiking Neural Networks (SNNs)", "Training Protocol"],
    content: `# Neuromorphic Augments

## What Are Neuromorphic Augments?
Neuromorphic augments are cognitive enhancement protocols that leverage silicon synaptic architectures to mirror the human brain's neural pathways. The DOJO training system uses gaze-tracked AGT (Augmented Gaze Tensor) patterns to stimulate and strengthen these pathways.

## How the DOJO Trains Augmentation
The DOJO captures three tensor dimensions through eye tracking:
- **COG (Cognitive)** - Analytical focus, problem-solving pathways
- **EMO (Emotional)** - Emotional regulation, empathy circuits
- **ENV (Environmental)** - Spatial awareness, environmental processing

## Spiking Neural Networks (SNNs)
Unlike traditional artificial neural networks, spiking neural networks process information through discrete pulses — just like biological neurons. The Jetson Orin Nano's GPU architecture is optimized for SNN inference, enabling real-time gaze classification at 60+ FPS.

## Training Protocol
1. Calibrate gaze baseline (10-second fixation)
2. Run AGT tensor distribution session (2-6 minutes)
3. Analyze COG/EMO/ENV balance via radar chart
4. Generate CSTB attestation for on-chain proof
5. Receive $OPTX rewards proportional to session quality
`,
  },
  {
    id: "emdr",
    title: "EMDR",
    icon: Eye,
    sections: ["Overview", "Connection to Gaze Training", "DOJO EMDR Protocol", "Benefits", "Research Foundation"],
    content: `# EMDR — Eye Movement Desensitization and Reprocessing

## Overview
EMDR is a psychotherapy technique that uses guided eye movements to help process traumatic memories. The DOJO adapts EMDR principles for cognitive augmentation — using structured gaze patterns to enhance neural plasticity.

## Connection to Gaze Training
The AGT tensor system maps naturally to EMDR's bilateral stimulation model:
- **Horizontal saccades** activate cross-hemispheric integration (COG tensor)
- **Vertical pursuit** engages emotional processing centers (EMO tensor)
- **Circular tracking** develops spatial-environmental awareness (ENV tensor)

## DOJO EMDR Protocol
The training session guides users through structured gaze movements:
1. Bilateral saccade warm-up (15 seconds)
2. Smooth pursuit tracking across AGT zones
3. Fixation hold at each tensor anchor point
4. Progressive speed increase over session duration

## Benefits
- Enhanced cross-hemispheric neural communication
- Improved emotional regulation through gaze-mediated feedback
- Stronger spatial memory encoding
- Measurable improvement in AGT tensor balance over sessions

## Research Foundation
EMDR was developed by Francine Shapiro in 1987 and has been extensively validated for PTSD treatment. The DOJO extends these principles into the realm of cognitive performance optimization.
`,
  },
  {
    id: "ophthalmology",
    title: "Ophthalmology",
    icon: ScanLine,
    sections: ["Ocular Anatomy for Gaze Auth", "Pupil Detection", "Retinal Scanning (Future)", "Visual Acuity & Tensor Resolution", "Key Metrics"],
    content: `# Ophthalmology — The Science Behind Gaze Tracking

## Ocular Anatomy for Gaze Auth
Gaze-based authentication relies on precise measurement of eye movements. The key structures:
- **Cornea** — Transparent front surface, creates first Purkinje reflection
- **Iris** — Controls pupil diameter, unique biometric identifier
- **Retina** — Contains photoreceptors, foveal fixation target
- **Extraocular muscles** — 6 muscles per eye, enable saccades and pursuits

## Pupil Detection
The DOJO uses the Orlosky Pupil Detection algorithm (optimized for Jetson ARM):
- Infrared illumination creates bright-pupil effect
- Ellipse fitting isolates pupil boundary
- Corneal reflection (CR) subtracted for head-movement compensation
- Gaze vector computed from pupil-CR offset

## Retinal Scanning (Future)
JETT's roadmap includes retinal vasculature mapping:
- Unique to each individual (more unique than fingerprints)
- Cannot be spoofed by contact lenses or photos
- Combined with gaze patterns for multi-factor biometric auth

## Visual Acuity & Tensor Resolution
- Foveal vision: 2 degrees of visual angle (high-res COG zone)
- Parafoveal: 2-5 degrees (EMO processing region)
- Peripheral: 5-90 degrees (ENV environmental scanning)

## Key Metrics
- Saccade velocity: 300-500 degrees/second
- Fixation duration: 200-600ms (meaningful gaze hold)
- Pupil dilation: 2-8mm range, involuntary emotional response
`,
  },
  {
    id: "jett",
    title: "JETT Protocol",
    icon: Zap,
    sections: ["What is JETT?", "How It Works", "Quantum Resistance", "The JETT PIN", "JETT Signature for Web3 Wallet", "How Analytics/Training Feed Your Signature", "Integration with CSTB"],
    content: `# JETT — Joule Encryption Temporal Template

## What is JETT?
JETT (Joule Encryption Temporal Template) is a quantum-resistant encryption protocol that derives cryptographic keys from temporal gaze patterns. Instead of passwords or private keys, JETT uses the unique temporal signature of your eye movements.

## How It Works
1. **Gaze Capture** — User performs a calibrated gaze sequence across AGT zones
2. **Temporal Sampling** — Microsecond-precision timestamps recorded for each fixation
3. **Knot Encoding** — Gaze positions and timing encoded as knot invariants
4. **JOULE Generation** — Just-in-time Optical Universal Lock Encryption key derived
5. **Hash & Attest** — JOULE hash stored on-chain via CSTB attestation

## Quantum Resistance
Traditional RSA/ECC keys are vulnerable to quantum computing attacks (Shor's algorithm). JETT's knot-encoded keys derive their security from:
- **Temporal entropy** — Microsecond timing variations are physically unreproducible
- **Biometric uniqueness** — Gaze patterns are unique per individual
- **Multi-dimensional encoding** — 3 AGT tensors + time = 4D key space
- **One-way hashing** — JOULE templates cannot be reverse-engineered to gaze data

## The JETT PIN
A 5-position gaze sequence that creates a reusable authentication key:
- Each position held for 800ms minimum
- Sequence order encodes the knot structure
- Combined with session nonce for replay protection
- Stored as CSTB attestation on Solana devnet

## JETT Signature for Web3 Wallet
The JETT Signature acts as a biometric seed for your wallet vault:
- **Gaze-Derived Seed** — Your AGT training sessions generate a unique gaze entropy pool
- **Deterministic Key Generation** — JOULE templates produce deterministic key material from temporal gaze data
- **Vault Signing** — Sign transactions with your gaze pattern instead of a hardware wallet
- **Recovery Protocol** — Reproduce your JETT PIN sequence to recover vault access (no seed phrase needed)

## How Analytics/Training Feed Your Signature
Your DOJO training sessions directly strengthen your JETT Signature:
1. **Training** builds your AGT tensor baseline (COG/EMO/ENV distribution)
2. **Analytics** tracks your signature stability across sessions
3. **Consistency score** determines signature strength (higher = more reliable key derivation)
4. **CSTB attestation** anchors your gaze signature on-chain for verification
5. **$OPTX rewards** scale with signature quality — better training = stronger rewards

## Integration with CSTB
The CompuStable (CSTB) smart contract validates JETT attestations:
- Minimum gaze duration: 2.22 seconds (222 centiseconds)
- AGT weight validation: COG + EMO + ENV = 10000
- Reward split: 60% staker / 30% validator / 10% mesh
- Agent wallet includes CSTB profile URI in agentMetadata()
`,
  },
  {
    id: "astroknots",
    title: "Astro.knots Hypothesis",
    icon: Network,
    sections: ["Overview", "Core Thesis", "EEG-Gaze Correlation", "BCI Applications", "The Knot Invariant", "Research Status"],
    content: `# The Astro.knots Hypothesis — EEG Training for BCIs

## Overview
The Astro.knots Hypothesis proposes that brainwave patterns (EEG) and gaze patterns share a common topological structure — mathematical knots — that can be used to create more accurate brain-computer interfaces (BCIs).

## Core Thesis
Neural oscillations (alpha, beta, theta, gamma waves) trace trajectories through phase space that form topological knots. These knots correspond to cognitive states that are also reflected in gaze behavior:
- **Alpha knots** (8-12 Hz) — Relaxed focus, correlates with balanced AGT distribution
- **Beta knots** (12-30 Hz) — Active thinking, correlates with COG tensor dominance
- **Theta knots** (4-8 Hz) — Deep processing, correlates with EMO tensor activation
- **Gamma knots** (30-100 Hz) — Peak cognition, correlates with rapid gaze saccades

## EEG-Gaze Correlation
The DOJO training system captures gaze data that mirrors EEG patterns:
- Fixation duration maps to alpha/theta power
- Saccade velocity maps to beta/gamma frequency
- AGT tensor balance maps to hemispheric coherence
- Pupil dilation maps to arousal (sympathetic activation)

## BCI Applications
By training on gaze-EEG correlations, the system can:
1. Predict cognitive state from gaze alone (no EEG hardware needed)
2. Calibrate BCI systems using gaze as ground truth
3. Create hybrid gaze-EEG authentication protocols
4. Enable neurofeedback training through the DOJO interface

## The Knot Invariant
Each individual's EEG-gaze knot has a unique mathematical invariant — a number that distinguishes one knot type from another. This invariant could serve as a biometric identifier even more unique than fingerprints or retinal patterns.

## Research Status
The Astro.knots Hypothesis is under active investigation at JETT Optics. Current work focuses on:
- Collecting paired EEG-gaze datasets via the Seeker device
- Computing knot invariants from time-series data
- Validating knot stability across sessions
- Publishing findings for peer review
`,
  },
]

export default function AugmentsPage() {
  const [activeAugment, setActiveAugment] = useState("neuromorphic")
  const [copied, setCopied] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  useEffect(() => {
    const saved = localStorage.getItem('dojo-theme') as 'dark' | 'light' | null;
    if (saved) setTheme(saved);
    const handler = (e: Event) => setTheme((e as CustomEvent).detail);
    window.addEventListener('dojo-theme-change', handler);
    return () => window.removeEventListener('dojo-theme-change', handler);
  }, []);
  const isDark = theme === 'dark';
  const contentRef = useRef<HTMLDivElement>(null)
  const active = augments.find((a) => a.id === activeAugment)

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Track active section on scroll
  useEffect(() => {
    const container = contentRef.current
    if (!container) return

    const handleScroll = () => {
      const headings = container.querySelectorAll('[data-section]')
      let current = ""
      headings.forEach((heading) => {
        const el = heading as HTMLElement
        const rect = el.getBoundingClientRect()
        if (rect.top <= 120) {
          current = el.getAttribute('data-section') || ""
        }
      })
      setActiveSection(current)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [activeAugment])

  const scrollToSection = (section: string) => {
    const container = contentRef.current
    if (!container) return
    const el = container.querySelector(`[data-section="${section}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="flex h-screen relative">
      {/* Subtle dotted background */}
      <DottedGlowBackground
        className="pointer-events-none z-0 !fixed"
        opacity={isDark ? 0.7 : 0.4}
        gap={14}
        radius={1.5}
        color={isDark ? "rgba(181, 82, 0, 0.35)" : "rgba(181, 82, 0, 0.2)"}
        glowColor={isDark ? "rgba(181, 82, 0, 0.8)" : "rgba(181, 82, 0, 0.5)"}
        darkColor="rgba(181, 82, 0, 0.35)"
        darkGlowColor="rgba(181, 82, 0, 0.8)"
        backgroundOpacity={0}
        speedMin={0.2}
        speedMax={0.6}
        speedScale={0.7}
      />

      {/* Augment Nav — secondary sidebar */}
      <div className={`w-52 border-r ${isDark ? 'border-orange-500/15 bg-zinc-950/80' : 'border-orange-200/30 bg-white/60'} backdrop-blur-sm p-3 space-y-1 shrink-0 relative z-10`}>
        <p className={`text-[9px] ${isDark ? 'text-orange-400/40' : 'text-zinc-400'} font-mono uppercase tracking-widest px-2 mb-3`}>
          Augment Journal
        </p>
        {augments.map((aug) => (
          <button
            key={aug.id}
            onClick={() => { setActiveAugment(aug.id); setActiveSection(""); }}
            className={`group flex items-start gap-2 w-full px-3 py-2.5 rounded-lg text-xs font-mono transition-all duration-200 text-left ${
              activeAugment === aug.id
                ? `${isDark ? 'bg-orange-500/15 text-orange-400' : 'bg-orange-50 text-orange-800'} border-l-2 border-orange-500`
                : `${isDark ? 'text-orange-400/50 hover:text-orange-400' : 'text-zinc-500 hover:text-orange-800'} hover:bg-orange-500/8`
            }`}
          >
            <aug.icon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span className="leading-tight">{aug.title}</span>
          </button>
        ))}
      </div>

      {/* Augment Content */}
      <div ref={contentRef} className="flex-1 overflow-auto p-8 max-w-4xl relative z-10">
        {active && (
          <div className={`prose ${isDark ? 'prose-invert' : ''} prose-orange max-w-none`}>
            <div className={`font-mono ${isDark ? 'text-orange-100/90' : 'text-zinc-700'} text-sm leading-relaxed whitespace-pre-wrap`}>
              {active.content.split(/(```[\s\S]*?```)/g).map((part, i) => {
                if (part.startsWith("```")) {
                  const code = part.replace(/```\w*\n?/, "").replace(/```$/, "").trim()
                  return (
                    <div key={i} className="relative my-4">
                      <button
                        onClick={() => copyCode(code)}
                        className="absolute top-2 right-2 p-1 rounded bg-zinc-700/50 hover:bg-zinc-600/50 transition-colors"
                      >
                        {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-zinc-400" />}
                      </button>
                      <pre className={`${isDark ? 'bg-zinc-900/80 border-orange-500/15' : 'bg-zinc-900/90 border-orange-200/30'} border rounded-lg p-4 text-xs overflow-x-auto`}>
                        <code className="text-orange-200/80">{code}</code>
                      </pre>
                    </div>
                  )
                }
                return (
                  <span key={i}>
                    {part.split("\n").map((line, j) => {
                      if (line.startsWith("# ")) return <h1 key={j} className={`text-2xl font-bold ${isDark ? 'text-orange-400' : 'text-orange-800'} mt-6 mb-3 font-mono`}>{line.slice(2)}</h1>
                      if (line.startsWith("## ")) {
                        const text = line.slice(3)
                        return <h2 key={j} data-section={text} className={`text-lg font-bold ${isDark ? 'text-orange-300' : 'text-orange-700'} mt-5 mb-2 font-mono scroll-mt-4`}>{text}</h2>
                      }
                      if (line.startsWith("### ")) return <h3 key={j} className={`text-sm font-bold ${isDark ? 'text-orange-200' : 'text-orange-900'} mt-4 mb-1 font-mono`}>{line.slice(4)}</h3>
                      if (line.startsWith("- ")) {
                        // Parse bold markers
                        const parts = line.slice(2).split(/(\*\*.*?\*\*)/g)
                        return (
                          <div key={j} className={`pl-4 py-0.5 ${isDark ? 'text-orange-100/70' : 'text-zinc-600'}`}>
                            <span className="text-orange-500/60 mr-1">•</span>
                            {parts.map((p, k) =>
                              p.startsWith("**") && p.endsWith("**")
                                ? <strong key={k} className={isDark ? 'text-orange-300' : 'text-orange-700'}>{p.slice(2, -2)}</strong>
                                : <span key={k}>{p}</span>
                            )}
                          </div>
                        )
                      }
                      if (/^\d+\./.test(line)) return <div key={j} className={`pl-4 py-0.5 ${isDark ? 'text-orange-100/70' : 'text-zinc-600'}`}>{line}</div>
                      if (line.trim() === "") return <div key={j} className="h-2" />
                      return <div key={j} className={isDark ? 'text-orange-100/70' : 'text-zinc-600'}>{line}</div>
                    })}
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* On this page — right TOC sidebar (desktop only) */}
      {active && (
        <div className="hidden xl:block w-48 shrink-0 p-4 relative z-10">
          <div className="sticky top-8">
            <p className={`text-[9px] ${isDark ? 'text-orange-400/40' : 'text-zinc-400'} font-mono uppercase tracking-widest mb-3 flex items-center gap-1`}>
              <ChevronRight className="w-3 h-3" />
              On this page
            </p>
            <div className={`space-y-0.5 border-l ${isDark ? 'border-orange-500/10' : 'border-orange-200/30'}`}>
              {active.sections.map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`block w-full text-left pl-3 py-1 text-[11px] font-mono transition-all duration-200 border-l-2 -ml-px ${
                    activeSection === section
                      ? `border-orange-500 ${isDark ? 'text-orange-400' : 'text-orange-700'}`
                      : `border-transparent ${isDark ? 'text-orange-400/40 hover:text-orange-400/70' : 'text-zinc-400 hover:text-zinc-600'} hover:border-orange-500/30`
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
