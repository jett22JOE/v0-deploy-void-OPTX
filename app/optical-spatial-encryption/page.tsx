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
    publishedTime: "2025-01-15T00:00:00Z",
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
                  alt="DAPP Logo"
                  width={32}
                  height={32}
                  className="relative inline-flex rounded-full object-contain"
                />
              </span>
            </div>
            <span className="font-mono text-xs tracking-widest text-muted-foreground">DAPP</span>
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
            By Jett Optics Research | January 2025
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
              This approach creates what we call <strong className="text-accent">Adaptive Gaze Tensors (AGTs)</strong>—mathematical
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
              Adaptive Gaze Tensors: The Core Technology
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
              This creates a DePIN (Decentralized Physical Infrastructure Network) where:
            </p>
            <ul className="space-y-2 mb-6">
              <li className="font-mono text-sm md:text-base text-muted-foreground">
                • Your attention becomes a scarce, valuable resource
              </li>
              <li className="font-mono text-sm md:text-base text-muted-foreground">
                • Bots and fake accounts cannot participate (no real eyes = no AGT signature)
              </li>
              <li className="font-mono text-sm md:text-base text-muted-foreground">
                • Network security scales with human participation, not hardware
              </li>
            </ul>
          </section>

          {/* OPTX Tokenomics */}
          <section className="mb-12">
            <h2 className="font-sans text-2xl md:text-3xl font-light mb-6 text-white">
              $JTX Token and DePIN Integration
            </h2>
            <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
              Built on Solana for high throughput and low latency, <strong className="text-accent">$JTX</strong> is now live on Raydium and serves multiple functions:
            </p>
            <ul className="space-y-2 mb-6">
              <li className="font-mono text-sm md:text-base text-muted-foreground">
                • <strong className="text-white">Authentication fees</strong>—applications pay in $JTX to verify users
              </li>
              <li className="font-mono text-sm md:text-base text-muted-foreground">
                • <strong className="text-white">Attention rewards</strong>—users earn $JTX for genuine engagement
              </li>
              <li className="font-mono text-sm md:text-base text-muted-foreground">
                • <strong className="text-white">Governance</strong>—token holders vote on protocol upgrades
              </li>
              <li className="font-mono text-sm md:text-base text-muted-foreground">
                • <strong className="text-white">Staking</strong>—secure the network and earn yield
              </li>
            </ul>

            {/* Token Links */}
            <div className="relative overflow-hidden bg-gradient-to-br from-accent/10 via-white/5 to-purple-500/10 border border-accent/30 rounded-2xl p-8 mb-6">
              {/* Background glow effect */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />

              <div className="relative z-10">
                <h3 className="font-mono text-sm tracking-[0.3em] text-accent mb-6 flex items-center gap-3">
                  <span className="inline-block w-2 h-2 bg-accent rounded-full animate-pulse" />
                  $JTX TOKEN — LIVE ON SOLANA
                </h3>

                {/* Contract Address */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8 p-4 bg-black/30 rounded-xl border border-white/10">
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Contract:</span>
                  <code className="font-mono text-sm text-white bg-white/10 px-3 py-2 rounded-lg break-all select-all hover:bg-white/20 transition-colors cursor-pointer">
                    9XpJiKEYzq5yDo5pJzRfjSRMPL2yPfDQXgiN7uYtBhUj
                  </code>
                </div>

                {/* Token Link Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <a
                    href="https://solscan.io/token/9XpJiKEYzq5yDo5pJzRfjSRMPL2yPfDQXgiN7uYtBhUj"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 font-mono text-sm px-5 py-4 bg-gradient-to-r from-[#14F195]/20 to-[#9945FF]/20 hover:from-[#14F195]/30 hover:to-[#9945FF]/30 text-white border border-[#14F195]/40 hover:border-[#14F195]/60 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#14F195]/20"
                  >
                    <Image
                      src="/icons/solscan.ico"
                      alt="Solscan"
                      width={24}
                      height={24}
                      className="rounded"
                    />
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
                    <Image
                      src="/icons/dexscreener.png"
                      alt="DexScreener"
                      width={24}
                      height={24}
                      className="rounded"
                    />
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
                    <Image
                      src="/icons/raydium.ico"
                      alt="Raydium"
                      width={24}
                      height={24}
                      className="rounded"
                    />
                    <span className="font-semibold">Trade on Raydium</span>
                    <svg className="w-4 h-4 ml-auto opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>

                  <a
                    href="https://www.orca.so/pools/2LX2Wb3Zz4qZWbtdpcs3ixGiw4CtfwoSwuhtLJiMKFRv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 font-mono text-sm px-5 py-4 bg-gradient-to-r from-[#1a1a2e]/80 to-[#FFD700]/20 hover:from-[#1a1a2e] hover:to-[#FFD700]/40 text-white border border-[#FFD700]/40 hover:border-[#FFD700]/60 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#FFD700]/20"
                  >
                    <svg className="w-6 h-6 rounded" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="32" height="32" rx="8" fill="#FFD700"/>
                      <path d="M16 6C10.477 6 6 10.477 6 16s4.477 10 10 10 10-4.477 10-10S21.523 6 16 6zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" fill="#1a1a2e"/>
                      <path d="M16 10c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z" fill="#1a1a2e"/>
                    </svg>
                    <span className="font-semibold">JTX/USD1 on Orca</span>
                    <svg className="w-4 h-4 ml-auto opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed">
              The AARON Protocol (Asynchronous Audit RAG Optical Node) handles on-chain verification,
              using retrieval-augmented generation to audit cryptographic operations across the distributed network.
            </p>
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
              Join us in pioneering the next evolution of digital security.
            </p>
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
            datePublished: "2025-01-15",
            dateModified: "2025-01-15",
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": "https://jettoptics.ai/optical-spatial-encryption",
            },
            keywords: "spatial encryption, DePIN, gaze-based encryption, AGT tensors, proof-of-attention, post-quantum cryptography, Markov chains, $JTX, $OPTX, Solana token",
          }),
        }}
      />
    </main>
  )
}
