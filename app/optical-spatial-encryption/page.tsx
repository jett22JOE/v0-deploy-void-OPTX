import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { SeoCTASection } from "@/components/seo-cta-section"

export const metadata: Metadata = {
  title: "Spatial Encryption: Post-Quantum Gaze Security | Jett Optics | DePIN",
  description: "Learn how spatial encryption uses AGT gaze tensors, Markov chains, and proof-of-attention to create post-quantum biometric authentication. The future of Web3 and DePIN security.",
  keywords: [
    "spatial encryption",
    "DePIN",
    "gaze-based encryption",
    "AGT tensors explained",
    "proof-of-attention blockchain",
    "post-quantum cryptography",
    "Markov chain cryptography",
    "biometric authentication Web3",
    "eye tracking security",
    "$JTX token",
    "$OPTX token",
    "$CSTB token",
    "ERC-8004 agent wallet",
    "AARON protocol",
    "Astro Knots",
  ],
  alternates: {
    canonical: "https://jettoptics.ai/optical-spatial-encryption",
  },
  openGraph: {
    type: "article",
    title: "Spatial Encryption: Post-Quantum Gaze Security | DePIN",
    description: "How AGT gaze tensors and Markov chains create post-quantum biometric authentication for Web3 and DePIN.",
    url: "https://jettoptics.ai/optical-spatial-encryption",
    images: ["/icons/lightLOGOjettoptics.jpeg"],
    publishedTime: "2026-02-20T00:00:00Z",
    authors: ["Jett Optics"],
  },
}

export default function OpticalSpatialEncryptionPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-xl bg-background/80 border-b border-white/10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2"
          >
            <div className="relative w-8 h-8 md:w-6 md:h-6 flex items-center justify-center">
              <span className="relative flex h-full w-full">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <Image
                  src="/images/astroknots-logo.png"
                  alt="Jett Optics"
                  width={32}
                  height={32}
                  className="relative inline-flex rounded-full object-contain"
                />
              </span>
            </div>
            <span className="font-mono text-xs tracking-widest text-muted-foreground"><span className="text-orange-500">JETT</span> Optics</span>
          </Link>
          <Link
            href="/#spatial-encryption"
            className="flex items-center"
          >
            <Image
              src="/icons/techforce_OPTX.png"
              alt="Jett Optics"
              width={50}
              height={50}
              className="object-contain"
            />
          </Link>
        </div>
      </nav>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        {/* Header */}
        <header className="mb-16">
          <p className="font-mono text-xs tracking-[0.3em] text-accent mb-4">
            TECHNICAL OVERVIEW
          </p>
          <h1 className="font-sans text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-8 leading-tight">
            Optical Spatial Encryption:{" "}
            <span className="italic text-orange-500">Gaze-Powered Post-Quantum Security</span>
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            By Jett Optics Research | February 2026
          </p>
        </header>

        {/* Article Body */}
        <div className="prose prose-invert prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-12">
            <p className="font-mono text-base md:text-lg text-muted-foreground leading-relaxed">
              In an era where quantum computers threaten to break traditional encryption and deepfakes can replicate faces and voices,
              <strong className="text-white"> optical spatial encryption</strong> emerges as a revolutionary paradigm.
              Pioneered by Jett Optics, this technology transforms the unique patterns of your eye movements into
              cryptographic keys that are inherently resistant to quantum attacks and impossible to spoof.
            </p>
          </section>

          {/* What is Optical Spatial Encryption */}
          <section className="mb-12">
            <h2 className="font-sans text-2xl md:text-3xl font-light mb-6 text-white">
              What is Optical Spatial Encryption?
            </h2>
            <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              Optical spatial encryption is a next-generation cryptographic method that derives encryption keys from
              the spatial patterns of human gaze. Unlike traditional biometrics that capture static features (fingerprints, iris patterns),
              optical spatial encryption analyzes the <em>dynamic trajectories</em> of eye movements as they navigate visual stimuli.
            </p>
            <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              This approach creates what we call <strong className="text-accent">Agentive Gaze Tensors (AGTs)</strong>—mathematical
              representations of your unique visual attention patterns that evolve with you over time, making them virtually
              impossible to steal or replicate.
            </p>
            <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed">
              Traditional optical encryption in academia focuses on encoding information in light waves. Jett Optics takes this
              further by encoding <em>identity</em> itself—using the optical pathway between eye and screen as the encryption medium.
            </p>
          </section>

          {/* AGT Tensors */}
          <section className="mb-12">
            <h2 className="font-sans text-2xl md:text-3xl font-light mb-6 text-white">
              Agentive Gaze Tensors: The Core Technology
            </h2>
            <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              AGTs classify eye movements into three orthogonal vector spaces on a 2-simplex:
            </p>
            <ul className="space-y-3 mb-6">
              <li className="font-mono text-sm md:text-base text-muted-foreground flex items-start gap-3">
                <span className="text-accent font-bold">COG</span>
                <span>Cognitive vectors—patterns reflecting thought processes, decision-making, and visual search strategies</span>
              </li>
              <li className="font-mono text-sm md:text-base text-muted-foreground flex items-start gap-3">
                <span className="text-accent font-bold">EMO</span>
                <span>Emotional vectors—subtle variations in saccades and fixations influenced by emotional state</span>
              </li>
              <li className="font-mono text-sm md:text-base text-muted-foreground flex items-start gap-3">
                <span className="text-accent font-bold">ENV</span>
                <span>Environmental vectors—adaptations to lighting, device, and contextual factors</span>
              </li>
            </ul>
            <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed">
              The tensor representation captures not just where you look, but <em>how</em> you look—the velocity,
              acceleration, and micro-corrections that form your unique visual signature. This signature is then
              processed through Markov chain state transitions to create mutation-resistant cryptographic hashes.
            </p>
          </section>

          {/* Markov Chain Cryptography */}
          <section className="mb-12">
            <h2 className="font-sans text-2xl md:text-3xl font-light mb-6 text-white">
              Markov Chain Cryptography for Quantum Resistance
            </h2>
            <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              Jett Optics leverages Markov chain state transitions to transform gaze trajectories into post-quantum
              cryptographic primitives. Your eye movement sequence forms a probabilistic state machine where each
              fixation and saccade represents a transition.
            </p>
            <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              The transition probabilities and state sequences create cryptographic signatures that are:
            </p>
            <ul className="space-y-2 mb-6">
              <li className="font-mono text-sm md:text-base text-muted-foreground">
                • <strong className="text-white">Collision-resistant</strong>—different gaze patterns produce statistically unique state sequences
              </li>
              <li className="font-mono text-sm md:text-base text-muted-foreground">
                • <strong className="text-white">Mutation-resistant</strong>—small changes to input create divergent probabilistic outcomes
              </li>
              <li className="font-mono text-sm md:text-base text-muted-foreground">
                • <strong className="text-white">Quantum-resistant</strong>—the stochastic nature resists quantum algorithmic attacks
              </li>
            </ul>
            <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed">
              This approach enables practical real-time authentication on mobile devices via ARKit, MediaPipe, and OpenXR.
            </p>
          </section>

          {/* Proof of Attention */}
          <section className="mb-12">
            <h2 className="font-sans text-2xl md:text-3xl font-light mb-6 text-white">
              Proof-of-Attention: Beyond PoW and PoS
            </h2>
            <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              Traditional blockchain consensus mechanisms have limitations: Proof-of-Work (PoW) wastes energy,
              Proof-of-Stake (PoS) concentrates power among the wealthy. Jett Optics introduces
              <strong className="text-accent"> Proof-of-Attention (PoA)</strong>—a novel consensus mechanism
              where your visual engagement generates network value.
            </p>
            <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              Every authenticated interaction on the Jett Optics network validates your presence and attention,
              contributing to network security while earning <strong className="text-accent">$OPTX tokens</strong>.
              Verified sessions generate <strong className="text-accent">$CSTB trust attestations</strong> on-chain,
              building a composable reputation score. This creates a DePIN (Decentralized Physical Infrastructure Network) where:
            </p>
            <ul className="space-y-2 mb-6">
              <li className="font-mono text-sm md:text-base text-muted-foreground">
                • Your attention becomes a scarce, valuable resource rewarded with $OPTX
              </li>
              <li className="font-mono text-sm md:text-base text-muted-foreground">
                • Each session mints a $CSTB attestation proving genuine human engagement
              </li>
              <li className="font-mono text-sm md:text-base text-muted-foreground">
                • Bots and fake accounts cannot participate (no real eyes = no AGT signature)
              </li>
              <li className="font-mono text-sm md:text-base text-muted-foreground">
                • Network security scales with human participation, not hardware
              </li>
            </ul>
          </section>

          {/* Token Ecosystem */}
          <section className="mb-12">
            <h2 className="font-sans text-2xl md:text-3xl font-light mb-6 text-white">
              Token Ecosystem & DePIN Integration
            </h2>
            <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed mb-6">
              The Jett Optics protocol operates on Solana with a multi-token architecture, each serving a distinct role in the DePIN economy:
            </p>

            {/* $OPTX Token Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-accent/10 via-white/5 to-purple-500/10 border border-accent/30 rounded-2xl p-8 mb-6">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h3 className="font-mono text-sm tracking-[0.3em] text-accent mb-6 flex items-center gap-3">
                  <span className="inline-block w-2 h-2 bg-accent rounded-full animate-pulse" />
                  $OPTX — PRIMARY UTILITY TOKEN
                </h3>
                <p className="font-mono text-sm text-muted-foreground mb-4">
                  The core utility token powering DePIN rewards, gaze verification fees, and JOE AI engagement incentives.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 p-4 bg-black/30 rounded-xl border border-white/10">
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Contract:</span>
                  <code className="font-mono text-sm text-white bg-white/10 px-3 py-2 rounded-lg break-all select-all hover:bg-white/20 transition-colors cursor-pointer">
                    4r9W2cLj4BRzJRrYCteoVXkMFVu2bKfCH1bBxBvz7VdS
                  </code>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a
                    href="https://solscan.io/token/4r9W2cLj4BRzJRrYCteoVXkMFVu2bKfCH1bBxBvz7VdS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 font-mono text-sm px-5 py-4 bg-gradient-to-r from-[#14F195]/20 to-[#9945FF]/20 hover:from-[#14F195]/30 hover:to-[#9945FF]/30 text-white border border-[#14F195]/40 hover:border-[#14F195]/60 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#14F195]/20"
                  >
                    <Image src="/icons/solscan.ico" alt="Solscan" width={24} height={24} className="rounded" />
                    <span className="font-semibold">Solscan</span>
                    <svg className="w-4 h-4 ml-auto opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <a
                    href="https://dexscreener.com/solana/4r9W2cLj4BRzJRrYCteoVXkMFVu2bKfCH1bBxBvz7VdS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 font-mono text-sm px-5 py-4 bg-gradient-to-r from-[#1C1C28]/80 to-[#2D2D3A]/80 hover:from-[#1C1C28] hover:to-[#2D2D3A] text-white border border-white/20 hover:border-white/40 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10"
                  >
                    <Image src="/icons/dexscreener.png" alt="DexScreener" width={24} height={24} className="rounded" />
                    <span className="font-semibold">DexScreener</span>
                    <svg className="w-4 h-4 ml-auto opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* $JTX Token Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500/10 via-white/5 to-teal-500/10 border border-cyan-500/30 rounded-2xl p-8 mb-6">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h3 className="font-mono text-sm tracking-[0.3em] text-cyan-400 mb-6 flex items-center gap-3">
                  <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  $JTX — COMMUNITY VAULT & GOVERNANCE
                </h3>
                <p className="font-mono text-sm text-muted-foreground mb-4">
                  The community governance token powering the Astro Knots vault. Token holders vote on protocol upgrades and earn staking yield.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 p-4 bg-black/30 rounded-xl border border-white/10">
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Contract:</span>
                  <code className="font-mono text-sm text-white bg-white/10 px-3 py-2 rounded-lg break-all select-all hover:bg-white/20 transition-colors cursor-pointer">
                    9XpJiKEYzq5yDo5pJzRfjSRMPL2yPfDQXgiN7uYtBhUj
                  </code>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <a
                    href="https://solscan.io/token/9XpJiKEYzq5yDo5pJzRfjSRMPL2yPfDQXgiN7uYtBhUj"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 font-mono text-sm px-5 py-4 bg-gradient-to-r from-[#14F195]/20 to-[#9945FF]/20 hover:from-[#14F195]/30 hover:to-[#9945FF]/30 text-white border border-[#14F195]/40 hover:border-[#14F195]/60 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#14F195]/20"
                  >
                    <Image src="/icons/solscan.ico" alt="Solscan" width={24} height={24} className="rounded" />
                    <span className="font-semibold">Solscan</span>
                    <svg className="w-4 h-4 ml-auto opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <a
                    href="https://dexscreener.com/solana/9XpJiKEYzq5yDo5pJzRfjSRMPL2yPfDQXgiN7uYtBhUj"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 font-mono text-sm px-5 py-4 bg-gradient-to-r from-[#1C1C28]/80 to-[#2D2D3A]/80 hover:from-[#1C1C28] hover:to-[#2D2D3A] text-white border border-white/20 hover:border-white/40 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10"
                  >
                    <Image src="/icons/dexscreener.png" alt="DexScreener" width={24} height={24} className="rounded" />
                    <span className="font-semibold">DexScreener</span>
                    <svg className="w-4 h-4 ml-auto opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <a
                    href="https://raydium.io/swap/?inputMint=9XpJiKEYzq5yDo5pJzRfjSRMPL2yPfDQXgiN7uYtBhUj&outputMint=sol"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 font-mono text-sm px-5 py-4 bg-gradient-to-r from-[#2E1065]/80 to-[#7C3AED]/30 hover:from-[#2E1065] hover:to-[#7C3AED]/50 text-white border border-[#7C3AED]/40 hover:border-[#7C3AED]/60 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#7C3AED]/20"
                  >
                    <Image src="/icons/raydium.ico" alt="Raydium" width={24} height={24} className="rounded" />
                    <span className="font-semibold">Raydium</span>
                    <svg className="w-4 h-4 ml-auto opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* $CSTB + DePIN Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* $CSTB Card */}
              <div className="relative overflow-hidden bg-gradient-to-br from-green-500/10 via-white/5 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6">
                <div className="relative z-10">
                  <h3 className="font-mono text-sm tracking-[0.3em] text-green-400 mb-4 flex items-center gap-3">
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    $CSTB — TRUST ATTESTATION
                  </h3>
                  <p className="font-mono text-xs text-muted-foreground mb-4">
                    On-chain biometric proofs minted after verified gaze sessions. Composable reputation for the attention economy.
                  </p>
                  <div className="p-3 bg-black/30 rounded-xl border border-white/10">
                    <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Contract:</span>
                    <code className="font-mono text-xs text-white break-all select-all cursor-pointer">
                      4waAiAhLDAefLNoBbPkAsLcHRPHmpJpQTzVfiYMkwBwZ
                    </code>
                  </div>
                </div>
              </div>

              {/* DePIN Program Card */}
              <div className="relative overflow-hidden bg-gradient-to-br from-yellow-500/10 via-white/5 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-6">
                <div className="relative z-10">
                  <h3 className="font-mono text-sm tracking-[0.3em] text-yellow-400 mb-4 flex items-center gap-3">
                    <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    DePIN PROGRAM
                  </h3>
                  <p className="font-mono text-xs text-muted-foreground mb-4">
                    On-chain staking and validation program. Stake $OPTX to secure the network and earn yield from verification fees.
                  </p>
                  <div className="p-3 bg-black/30 rounded-xl border border-white/10">
                    <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Program:</span>
                    <code className="font-mono text-xs text-white break-all select-all cursor-pointer">
                      91SqqMPFxMBJbJsAtCEzCoz9HsU8n3FJBCLE3xgo9Lds
                    </code>
                  </div>
                </div>
              </div>
            </div>

            <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed">
              Together, these tokens form a self-reinforcing DePIN economy: $OPTX rewards genuine attention, $JTX governs the community vault,
              $CSTB attests to biometric authenticity, and the DePIN program anchors staking and validation on-chain.
            </p>
          </section>

          {/* AARON Protocol */}
          <section className="mb-12">
            <h2 className="font-sans text-2xl md:text-3xl font-light mb-6 text-white">
              AARON Protocol: On-Chain Biometric Verification
            </h2>
            <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              The <strong className="text-accent">AARON Protocol</strong> (Asynchronous Audit RAG Optical Node) is the backbone of
              on-chain verification. It processes gaze sessions into biometric proofs anchored to the Astro Knots registry,
              creating a tamper-proof chain of attestation from raw eye movement data to on-chain identity.
            </p>
            <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              Each verified session generates a cryptographic proof that:
            </p>
            <ul className="space-y-2 mb-6">
              <li className="font-mono text-sm md:text-base text-muted-foreground">
                • Confirms a real human was present (anti-bot, anti-deepfake)
              </li>
              <li className="font-mono text-sm md:text-base text-muted-foreground">
                • Mints a $CSTB attestation token to the user&apos;s wallet
              </li>
              <li className="font-mono text-sm md:text-base text-muted-foreground">
                • Distributes $OPTX rewards proportional to session quality
              </li>
              <li className="font-mono text-sm md:text-base text-muted-foreground">
                • Anchors the biometric proof to the Astro Knots on-chain registry
              </li>
            </ul>
          </section>

          {/* Agent Wallet */}
          <section className="mb-12">
            <h2 className="font-sans text-2xl md:text-3xl font-light mb-6 text-white">
              ERC-8004 Agent Wallet: Cross-Chain Identity
            </h2>
            <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              The Jett Optics ecosystem includes an <strong className="text-accent">ERC-8004 compliant Agent Wallet</strong>—a
              soulbound identity that bridges Solana and Base (EVM) chains. This enables AI agents to hold assets, sign transactions,
              and participate in cross-chain DePIN operations autonomously.
            </p>
            <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              The agent wallet supports:
            </p>
            <ul className="space-y-2 mb-6">
              <li className="font-mono text-sm md:text-base text-muted-foreground">
                • <strong className="text-white">x402 payment protocol</strong>—API-level micropayments for AI services
              </li>
              <li className="font-mono text-sm md:text-base text-muted-foreground">
                • <strong className="text-white">LayerZero bridge</strong>—cross-chain asset transfers between Solana and Base
              </li>
              <li className="font-mono text-sm md:text-base text-muted-foreground">
                • <strong className="text-white">Soulbound metadata</strong>—non-transferable identity tied to the agent&apos;s gaze verification history
              </li>
              <li className="font-mono text-sm md:text-base text-muted-foreground">
                • <strong className="text-white">CSTB attestation binding</strong>—trust scores portable across chains
              </li>
            </ul>
          </section>

          {/* AI Orchestration */}
          <section className="mb-12">
            <h2 className="font-sans text-2xl md:text-3xl font-light mb-6 text-white">
              AI Orchestration: Edge Compute & Dual-Model Architecture
            </h2>
            <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              Jett Optics processes gaze data through a <strong className="text-accent">dual-AI architecture</strong> running on
              dedicated edge infrastructure. A primary reasoning model handles spatial analysis and tensor classification,
              while a secondary model provides fallback verification and cross-validation.
            </p>
            <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              The edge compute layer ensures:
            </p>
            <ul className="space-y-2 mb-6">
              <li className="font-mono text-sm md:text-base text-muted-foreground">
                • <strong className="text-white">Low-latency inference</strong>—gaze classification at the edge, not in the cloud
              </li>
              <li className="font-mono text-sm md:text-base text-muted-foreground">
                • <strong className="text-white">Privacy-first</strong>—raw biometric data never leaves the encrypted mesh network
              </li>
              <li className="font-mono text-sm md:text-base text-muted-foreground">
                • <strong className="text-white">Real-time AGT generation</strong>—tensor computation during active gaze sessions
              </li>
              <li className="font-mono text-sm md:text-base text-muted-foreground">
                • <strong className="text-white">Federated communication</strong>—secure inter-node messaging for distributed validation
              </li>
            </ul>
          </section>

          {/* Comparison */}
          <section className="mb-12">
            <h2 className="font-sans text-2xl md:text-3xl font-light mb-6 text-white">
              How It Compares to Traditional Methods
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-sm text-muted-foreground border-collapse">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 pr-4 text-white">Method</th>
                    <th className="text-left py-3 pr-4 text-white">Quantum Safe</th>
                    <th className="text-left py-3 pr-4 text-white">Spoof Resistant</th>
                    <th className="text-left py-3 text-white">Adaptive</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/10">
                    <td className="py-3 pr-4">Passwords</td>
                    <td className="py-3 pr-4 text-red-400">No</td>
                    <td className="py-3 pr-4 text-red-400">No</td>
                    <td className="py-3 text-red-400">No</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 pr-4">Fingerprint</td>
                    <td className="py-3 pr-4 text-yellow-400">Partial</td>
                    <td className="py-3 pr-4 text-yellow-400">Limited</td>
                    <td className="py-3 text-red-400">No</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 pr-4">Face ID</td>
                    <td className="py-3 pr-4 text-yellow-400">Partial</td>
                    <td className="py-3 pr-4 text-red-400">Deepfake Risk</td>
                    <td className="py-3 text-red-400">No</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 pr-4">Iris Scan</td>
                    <td className="py-3 pr-4 text-yellow-400">Partial</td>
                    <td className="py-3 pr-4 text-yellow-400">Limited</td>
                    <td className="py-3 text-red-400">No</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-accent font-bold">Optical Spatial (AGT)</td>
                    <td className="py-3 pr-4 text-green-400">Yes</td>
                    <td className="py-3 pr-4 text-green-400">Yes</td>
                    <td className="py-3 text-green-400">Yes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Future */}
          <section className="mb-12">
            <h2 className="font-sans text-2xl md:text-3xl font-light mb-6 text-white">
              The Future of Spatial Security
            </h2>
            <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              As XR (Extended Reality) becomes ubiquitous, eye tracking will be standard on every device.
              Jett Optics is building the infrastructure for this future—where your gaze becomes your
              password, your attention becomes valuable, and your identity becomes truly unbreakable.
            </p>
            <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed">
              Join the Astro Knots community and help pioneer the next evolution of digital security.
            </p>
          </section>

          {/* Astro Knots CTA */}
          <section className="mb-12">
            <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500/10 via-accent/5 to-teal-500/10 border border-cyan-500/30 rounded-2xl p-8 text-center">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/15 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h3 className="font-mono text-sm tracking-[0.3em] text-cyan-400 mb-4">
                  ASTRO KNOTS COMMUNITY VAULT
                </h3>
                <p className="font-mono text-sm text-muted-foreground mb-6 max-w-lg mx-auto">
                  Explore the community vault, stake $JTX, earn DePIN rewards, and join the mission to build decentralized spatial security.
                </p>
                <a
                  href="https://astroknots.space"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-mono text-sm tracking-widest rounded-full border border-cyan-500/40 hover:border-cyan-500/60 transition-all duration-300 hover:scale-[1.02]"
                >
                  VISIT ASTROKNOTS.SPACE
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </section>

          {/* CTA */}
          <SeoCTASection />
        </div>
      </article>

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Spatial Encryption: Post-Quantum Gaze Security for DePIN",
            description: "Learn how spatial encryption uses AGT gaze tensors, Markov chains, and proof-of-attention to create post-quantum biometric authentication for Web3 and DePIN.",
            image: "https://jettoptics.ai/icons/lightLOGOjettoptics.jpeg",
            author: {
              "@type": "Organization",
              name: "Jett Optics",
              url: "https://jettoptics.ai",
            },
            publisher: {
              "@type": "Organization",
              name: "Jett Optics",
              logo: {
                "@type": "ImageObject",
                url: "https://jettoptics.ai/icons/lightLOGOjettoptics.jpeg",
              },
            },
            datePublished: "2026-02-20",
            dateModified: "2026-02-20",
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": "https://jettoptics.ai/optical-spatial-encryption",
            },
            keywords: "spatial encryption, DePIN, gaze-based encryption, AGT tensors, proof-of-attention, post-quantum cryptography, Markov chains, $JTX, $OPTX, $CSTB, ERC-8004, AARON protocol, Astro Knots, Solana token",
          }),
        }}
      />
    </main>
  )
}
