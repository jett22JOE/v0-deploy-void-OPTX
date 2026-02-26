"use client"

import { useState, useEffect, useRef } from "react"
import { BrainCircuit, Eye, ScanLine, Zap, Network, Copy, Check, ChevronRight, GitBranch, Atom, MessageSquare, FlaskConical, ArrowUpRight, ThumbsUp, MessageCircle } from "lucide-react"
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background"

const augments = [
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
    title: "JETT Auth",
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
    id: "markov",
    title: "Markov Chains in Neural Trajectories",
    icon: GitBranch,
    sections: ["Stochastic Modeling of Saccadic Trajectories", "Transition Probability Matrices", "Hidden Markov Model Inference", "Ergodic Properties & Invariant Distributions", "Applications", "Journal Log"],
    content: `# Markov Chains in Neural Trajectories

## Stochastic Modeling of Saccadic Trajectories
Saccadic eye movements — rapid shifts between fixations — are modeled as a discrete-time Markov chain {X_t} with state space S = {COG, EMO, ENV}. Fixations represent states, and saccades induce transitions governed by time-homogeneous probabilities P(X_{t+1} = j | X_t = i) = p_ij, where the sum of p_ij over j equals 1.

The Chapman-Kolmogorov equations formalize multi-step transitions: p_ij^(m+n) = sum_k p_ik^(m) * p_kj^(n), or in matrix form P^(m+n) = P^m * P^n. This captures the memoryless property of saccades, approximating neural trajectories as first-order Markov processes validated by empirical gaze data in DOJO sessions.

## Transition Probability Matrices
DOJO infers user-specific transition matrices P_u from sequences of gaze fixations via maximum likelihood estimation. For a trajectory x_{1:T}, the log-likelihood is optimized subject to row-stochastic constraints using gradient ascent or expectation-maximization.

Each user u develops a personalized stochastic signature P_u, reflecting idiosyncratic cognitive biases — e.g., high p(COG -> EMO) for introspective learners. Matrices are compact (3x3), enabling real-time updates and clustering for cohort analysis.

## Hidden Markov Model Inference
Observed gaze positions (pixel coordinates) are noisy emissions from latent cognitive states. The AGT employs a Hidden Markov Model (HMM) with hidden chain {Z_t in S}, transition kernel P, emission densities f(y_t | Z_t = i) (e.g., Gaussian mixtures centered on gaze regions), and initial distribution pi.

Parameter estimation uses the Baum-Welch algorithm, an expectation-maximization (EM) procedure. The E-step computes posterior probabilities via forward-backward recursion, and the M-step updates transition probabilities proportionally. This yields Viterbi-decoded state sequences, denoising raw gaze for AGT tensor construction.

## Ergodic Properties & Invariant Distributions
Assuming irreducibility and aperiodicity (empirically verified in DOJO data), the chain is ergodic. The stationary distribution pi = (pi_COG, pi_EMO, pi_ENV) satisfies pi*P = pi. By the Perron-Frobenius theorem for positive matrices, pi is unique and attracting.

In AGT, pi_u quantifies cognitive baselines — e.g., pi_COG > 0.5 indicates analytical dominance — serving as long-term neural fingerprints.

## Applications
Markov models drive DOJO innovations:
- **Predictive UI** anticipates saccades via n-step forecasts P^n, preloading COG/EMO/ENV interfaces
- **Cognitive fatigue detection** monitors entropy decay H(P_u^t), where convergence to uniform P signals exhaustion
- **Personalized learning paths** adapt curricula by simulating trajectories under perturbed P_u
- **Biometric authentication** uses Frobenius norm ||P_u - P_v||_F as a Markov signature key, robust to spoofing

## Journal Log
DOJO's community journal accepts user-submitted gaze Markov models from verified sessions. Contributions include transition matrices P_u, stationary distributions pi_u, and AGT metrics (e.g., mixing time, second eigenvalue). Peer-reviewed entries populate a public repository, fostering collaborative neuroscience.
`,
  },
  {
    id: "postquantum",
    title: "Post-Quantum Lattice & Microtubule Cognition",
    icon: Atom,
    sections: ["Lattice-Based Cryptography in JETT Auth", "Microtubule Quantum Coherence", "Penrose-Hameroff Connection to Gaze", "JETT Integration", "Research Frontier"],
    content: `# Post-Quantum Lattice & Microtubule Cognition

## Lattice-Based Cryptography in JETT Auth
JETT Auth employs lattice-based cryptography as its post-quantum backbone, harnessing the conjectured hardness of lattice problems impervious to Shor's algorithm. Core primitives include the Learning With Errors (LWE) problem — solving for secret vectors in noisy modular equations — and its efficient variants: Ring-LWE (RLWE) over cyclotomic rings for reduced key sizes, and NTRU, inverting short polynomial convolutions.

Gaze temporal entropy, derived from AGT tensors, maps directly to lattice dimensions. High-resolution iris tracking yields fixation durations and saccade velocities, quantized into entropy vectors over 1ms bins. These populate lattice bases with dimension n ~ 1024. Security reduces to the Shortest Vector Problem (SVP), unfeasible even for quantum BKZ sieving. JETT's 256-bit keys achieve IND-CCA2 security with gaze-derived RLWE instances verified via Fujisaki-Okamoto transforms.

## Microtubule Quantum Coherence
Penrose-Hameroff's Orch OR theory posits microtubules — polymeric lattices of alpha/beta-tubulin heterodimers — as substrates for quantum computation in neurons. Each tubulin dimer supports dipole moments enabling London force-mediated superposition of conformational states. Unlike bulk water's picosecond decoherence, microtubule interiors may sustain coherence via dynamical screening, with decoherence times potentially reaching microsecond scales at 310K.

Tubulin acts as an 8-state qubit via collective vibrational modes, with gap energies matching spectra in the 0.1-10 THz range. Orch OR invokes gravity-induced collapse: superposition separation triggers objective reduction, selecting classical eigenstates.

## Penrose-Hameroff Connection to Gaze
Conscious saccade initiation — volitional shifts exceeding 0.5 degrees in 20-100ms — may originate from Orch OR events in ocular motor neurons. Quantum superposition across distributed microtubule arrays computes decision manifolds, collapsing at approximately 25ms, aligning with 40Hz gamma synchrony observed in EEG during fixation-to-saccade transitions.

Hameroff's model links this to thalamocortical binding: microtubule dipoles phase-lock via gap junctions, yielding massive numbers of tubulins per neocortical minicolumn participating in "moments of awareness."

## JETT Integration
JETT Auth's temporal gaze signatures — AGT(COG) for predictive fixations, AGT(EMO) for pupillary arousal gradients, AGT(ENV) for saliency maps — probe neural quantum coherence. The 2.22-second calibration window encompasses approximately 89 Orch OR cycles at 40Hz, enabling entropy extraction resilient to classical noise.

Gaze vectors encode lattice noise from microsaccadic jitter, hypothesized as amplified quantum fluctuations. Post-quantum keys thus derive from consciousness-correlated dynamics, with false-accept rates below 10^-9 via SVP-tuned thresholds.

## Research Frontier
Open questions abound: Does gaze entropy proxy microtubule coherence? Anesthesia studies (e.g., propofol binding tubulin C-termini) disrupt microtubules and abolish directed gaze, suggesting quantum etiology. Future avenues include quantum-resistant biometrics from Orch OR-derived hashes, testable via optogenetic microtubule labeling. JETT DOJO pioneers "consciousness cryptography" — where biometric uniqueness stems from non-computable quantum gravity effects.
`,
  },
  {
    id: "jettchat",
    title: "Jett-Chat Architecture",
    icon: MessageSquare,
    sections: ["Global Layer (Convex + JOE)", "Private Layer (SpacetimeDB)", "Local Layer (BitChat Mesh)", "AARON Router Intelligence", "JOE Agent Mobility"],
    content: `# Jett-Chat Architecture

Jett-Chat is a 3-layer hybrid messaging system designed for JETT Optics, enabling seamless communication across global, private, and local contexts. It prioritizes real-time reactivity, end-to-end security, and offline resilience.

## Global Layer (Convex + JOE)
The always-on internet layer utilizes Convex, a reactive real-time database, as the pub/sub nexus for scalable group messaging. Clients subscribe via useQuery hooks for live updates on channels, typing indicators (via ephemeral mutations), and presence (WebSocket heartbeats). Optimistic mutations enable instant UI feedback with server reconciliation via CRDTs.

JOE (jOSH Operating Environment), powered by Grok 4.1, resides here as a serverless agent. It processes natural language queries across chats using full-parameter inference, maintaining per-thread context in Convex tables. This layer handles unbounded audiences (>100 users) and non-sensitive data.

## Private Layer (SpacetimeDB)
Deployed edge-first on Jetson Orin Nano, the Private Layer uses SpacetimeDB for tamper-proof, on-device storage. All messages persist solely locally, eliminating cloud exfiltration risks. E2E encryption employs X25519 for ephemeral key exchange and ChaCha20-Poly1305 AEAD for authenticated encryption.

Tailored for 1-on-1 and small-group (<10) chats, it supports reactive queries via SpacetimeDB's SQL-like reducers. Zero-knowledge proofs confirm delivery without exposing content. Storage is append-only logs, pruned by TTL or gaze-confirmed reads.

## Local Layer (BitChat Mesh)
For zero-infrastructure scenarios, the Local Layer implements BitChat Mesh over BLE 5.0 (2.4GHz, 2Mbps PHY) and Wi-Fi Direct. Messages propagate via controlled flooding with TTL-based hop limits (max 5), forming ad-hoc topologies.

Ephemeral semantics enforce auto-deletion post-read or TTL expiry (default 5min), stored in RAM-only buffers. Reed-Solomon (255,223) FEC encodes payloads, adding ~10% overhead for 99.9% recovery up to 20% packet loss.

## AARON Router Intelligence
AARON, a lightweight decision engine on Jetson, routes messages dynamically based on:
- **Connectivity** — Internet available? BLE/Wi-Fi RSSI?
- **Audience size** — Number of recipients
- **Privacy class** — Public, sensitive, or classified
- **Latency SLA** — <100ms global, <1s local

Decision logic: Global if internet && |N|>10 && privacy<medium. Private if on-device && |N|<=10 && privacy>=medium. Local if !internet. Seamless failover queues undelivered mutations, replayed on reconnect.

## JOE Agent Mobility
JOE migrates context across layers without state loss:
- **Global** — Full Grok 4.1 inference (80B params)
- **Private** — Quantized 4-bit local inference on Jetson Orin (40 TOPS INT8)
- **Local** — Cached response patterns via FAISS index (<50ms)

Context serialized as Merkle-ized vectors, gossiped across layers. Transitions trigger reducer sync, ensuring conversational continuity across layer histories.
`,
  },
]

// ─── Lab Featured Threads (static data) ─────────────────────────────────────
const labCategories = [
  "Gaze Vectors & AGT", "Markov Chains & Prediction", "Microtubule & Quantum Cognition",
  "JETT Auth & Biometric Protocols", "Augment Net Graph", "DOJO Training Logs", "Wild Speculation",
]

const labThreads = [
  {
    id: "t1", title: "My 30-day AGT Markov chain evolution — 42% COG improvement",
    category: "Markov Chains & Prediction", badge: "agt-verified" as const,
    preview: "After training daily for 30 days, my transition matrix shifted dramatically. COG stationary distribution went from 0.28 to 0.40...",
    author: "neural_pioneer", timestamp: Date.now() - 86400000 * 2, upvotes: 127, replies: 34,
  },
  {
    id: "t2", title: "Post-quantum lattice proposal using gaze entropy",
    category: "Microtubule & Quantum Cognition", badge: "peer-reviewed" as const,
    preview: "Proposing a Ring-LWE instantiation where gaze temporal entropy directly parameterizes the noise distribution...",
    author: "lattice_theorist", timestamp: Date.now() - 86400000 * 5, upvotes: 89, replies: 22,
  },
  {
    id: "t3", title: "Should we expose transition matrices publicly?",
    category: "JETT Auth & Biometric Protocols", badge: "high-signal" as const,
    preview: "There's a privacy debate: if my Markov signature is my biometric key, publishing P_u could compromise authentication...",
    author: "crypto_ethicist", timestamp: Date.now() - 86400000 * 1, upvotes: 204, replies: 67,
  },
  {
    id: "t4", title: "First DOJO session — ENV tensor surprisingly dominant",
    category: "DOJO Training Logs", badge: "agt-verified" as const,
    preview: "Ran my first 6-minute training session. Expected COG dominance but ENV came in at 47%. Spatial awareness is my default?",
    author: "gaze_rookie", timestamp: Date.now() - 86400000 * 3, upvotes: 45, replies: 12,
  },
  {
    id: "t5", title: "Microtubule resonance detected at 40Hz gamma during COG training?",
    category: "Microtubule & Quantum Cognition", badge: "peer-reviewed" as const,
    preview: "Using paired EEG-gaze recording during DOJO, I found 40Hz gamma bursts precisely at saccade initiation points...",
    author: "orch_or_fan", timestamp: Date.now() - 86400000 * 7, upvotes: 156, replies: 41,
  },
]

const BADGE_CONFIG = {
  "agt-verified": { label: "🧬 AGT Verified", color: "text-green-400 bg-green-500/10 border-green-500/20" },
  "peer-reviewed": { label: "🔬 Peer Reviewed", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  "high-signal": { label: "⚡ High Signal", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
}

export default function AugmentsPage() {
  const [activeAugment, setActiveAugment] = useState("astroknots")
  const [copied, setCopied] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [viewMode, setViewMode] = useState<"journal" | "lab">("journal")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
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
        {/* Journal | Lab Toggle */}
        <div className={`flex rounded-lg p-0.5 mb-3 ${isDark ? 'bg-zinc-900/60' : 'bg-zinc-100'}`}>
          <button
            onClick={() => setViewMode("journal")}
            className={`flex-1 px-3 py-1.5 rounded-md text-[10px] font-mono font-semibold transition-all ${
              viewMode === "journal"
                ? `${isDark ? 'bg-orange-500/20 text-orange-400 shadow-sm' : 'bg-white text-orange-700 shadow-sm'}`
                : `${isDark ? 'text-zinc-500 hover:text-orange-400/70' : 'text-zinc-400 hover:text-orange-600'}`
            }`}
          >
            Journal
          </button>
          <button
            onClick={() => setViewMode("lab")}
            className={`flex-1 px-3 py-1.5 rounded-md text-[10px] font-mono font-semibold transition-all flex items-center justify-center gap-1 ${
              viewMode === "lab"
                ? `${isDark ? 'bg-orange-500/20 text-orange-400 shadow-sm' : 'bg-white text-orange-700 shadow-sm'}`
                : `${isDark ? 'text-zinc-500 hover:text-orange-400/70' : 'text-zinc-400 hover:text-orange-600'}`
            }`}
          >
            <FlaskConical className="w-3 h-3" />
            Lab
          </button>
        </div>

        {viewMode === "journal" ? (
          <>
            <p className={`text-[9px] ${isDark ? 'text-orange-400/40' : 'text-zinc-400'} font-mono uppercase tracking-widest px-2 mb-2`}>
              Research Entries
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
          </>
        ) : (
          <>
            <p className={`text-[9px] ${isDark ? 'text-orange-400/40' : 'text-zinc-400'} font-mono uppercase tracking-widest px-2 mb-2`}>
              Categories
            </p>
            <button
              onClick={() => setActiveCategory(null)}
              className={`w-full px-3 py-2 rounded-lg text-xs font-mono transition-all text-left ${
                activeCategory === null
                  ? `${isDark ? 'bg-orange-500/15 text-orange-400' : 'bg-orange-50 text-orange-800'} border-l-2 border-orange-500`
                  : `${isDark ? 'text-orange-400/50 hover:text-orange-400' : 'text-zinc-500 hover:text-orange-800'} hover:bg-orange-500/8`
              }`}
            >
              All Threads
            </button>
            {labCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full px-3 py-2 rounded-lg text-[11px] font-mono transition-all text-left ${
                  activeCategory === cat
                    ? `${isDark ? 'bg-orange-500/15 text-orange-400' : 'bg-orange-50 text-orange-800'} border-l-2 border-orange-500`
                    : `${isDark ? 'text-orange-400/50 hover:text-orange-400' : 'text-zinc-500 hover:text-orange-800'} hover:bg-orange-500/8`
                }`}
              >
                {cat}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Main Content Area */}
      {viewMode === "journal" ? (
        <>
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
        </>
      ) : (
        /* ═══════════════════ LAB VIEW ═══════════════════ */
        <div className="flex-1 overflow-auto p-6 md:p-8 relative z-10">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Lab Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-xl font-bold font-mono ${isDark ? 'text-orange-400' : 'text-orange-800'} flex items-center gap-2`}>
                  <FlaskConical className="w-5 h-5" />
                  Astro.knots Lab
                </h1>
                <p className={`font-mono text-xs mt-1 ${isDark ? 'text-orange-400/50' : 'text-zinc-500'}`}>
                  Community research forum — peer-reviewed experiments & DOJO findings
                </p>
              </div>
              <div className="relative group">
                <button className={`px-4 py-2 rounded-lg font-mono text-xs font-semibold transition-all ${
                  isDark
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30'
                    : 'bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200'
                }`}>
                  <ArrowUpRight className="w-3.5 h-3.5 inline mr-1.5" />
                  Share Your Experiment
                </button>
                <div className={`absolute right-0 top-full mt-2 w-64 p-3 rounded-lg text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 ${
                  isDark ? 'bg-zinc-900 border border-orange-500/20 text-zinc-400' : 'bg-white border border-orange-200 text-zinc-600 shadow-lg'
                }`}>
                  Requires JETT Auth verification + 1 JTX stake. Complete a gaze session to unlock.
                </div>
              </div>
            </div>

            {/* Category Chips (mobile-friendly) */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-mono font-semibold transition-all ${
                  activeCategory === null
                    ? `${isDark ? 'bg-orange-500/25 text-orange-300 border border-orange-500/40' : 'bg-orange-100 text-orange-700 border border-orange-300'}`
                    : `${isDark ? 'bg-zinc-800/60 text-zinc-400 border border-zinc-700/40 hover:border-orange-500/30' : 'bg-zinc-100 text-zinc-500 border border-zinc-200 hover:border-orange-300'}`
                }`}
              >
                All
              </button>
              {labCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-mono transition-all ${
                    activeCategory === cat
                      ? `${isDark ? 'bg-orange-500/25 text-orange-300 border border-orange-500/40' : 'bg-orange-100 text-orange-700 border border-orange-300'}`
                      : `${isDark ? 'bg-zinc-800/60 text-zinc-400 border border-zinc-700/40 hover:border-orange-500/30 hover:text-orange-400/70' : 'bg-zinc-100 text-zinc-500 border border-zinc-200 hover:border-orange-300'}`
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Featured Threads */}
            <div>
              <p className={`text-[9px] ${isDark ? 'text-orange-400/40' : 'text-zinc-400'} font-mono uppercase tracking-widest mb-3`}>
                Featured Threads
              </p>
              <div className="space-y-3">
                {labThreads
                  .filter((t) => !activeCategory || t.category === activeCategory)
                  .map((thread) => {
                    const badge = BADGE_CONFIG[thread.badge]
                    return (
                      <div
                        key={thread.id}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isDark
                            ? 'bg-zinc-900/40 border-orange-500/10 hover:border-orange-500/25 hover:bg-zinc-900/60'
                            : 'bg-white/80 border-orange-200/20 hover:border-orange-300/40 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            {/* Badge + Category */}
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold border ${badge.color}`}>
                                {badge.label}
                              </span>
                              <span className={`text-[9px] font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                {thread.category}
                              </span>
                            </div>
                            {/* Title */}
                            <h3 className={`font-mono text-sm font-semibold mb-1.5 ${isDark ? 'text-orange-200' : 'text-zinc-800'}`}>
                              {thread.title}
                            </h3>
                            {/* Preview */}
                            <p className={`font-mono text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'} line-clamp-2`}>
                              {thread.preview}
                            </p>
                            {/* Meta row */}
                            <div className="flex items-center gap-4 mt-3">
                              <span className={`font-mono text-[10px] ${isDark ? 'text-orange-400/60' : 'text-orange-600'}`}>
                                @{thread.author}
                              </span>
                              <span className={`font-mono text-[9px] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                {Math.floor((Date.now() - thread.timestamp) / 86400000)}d ago
                              </span>
                              <div className="flex items-center gap-3 ml-auto">
                                <span className={`flex items-center gap-1 font-mono text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                  <ThumbsUp className="w-3 h-3" /> {thread.upvotes}
                                </span>
                                <span className={`flex items-center gap-1 font-mono text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                  <MessageCircle className="w-3 h-3" /> {thread.replies}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                {labThreads.filter((t) => !activeCategory || t.category === activeCategory).length === 0 && (
                  <div className={`text-center py-12 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    <FlaskConical className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p className="font-mono text-xs">No threads in this category yet.</p>
                    <p className="font-mono text-[10px] mt-1">Be the first to share your experiment.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
