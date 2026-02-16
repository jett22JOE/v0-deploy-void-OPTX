import Link from "next/link"

export const metadata = {
  title: "Terms of Service | Jett Optics",
  description: "Terms of Service for Jett Optics spatial encryption platform.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="text-orange-400 hover:text-orange-300 text-sm font-mono mb-8 inline-block">&larr; Back to Jett Optics</Link>

        <h1 className="text-3xl font-bold font-mono tracking-wider text-orange-400 mb-2">TERMS OF SERVICE</h1>
        <p className="text-sm text-zinc-500 font-mono mb-12">Last updated: February 15, 2026</p>

        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed font-mono">
          <section>
            <h2 className="text-lg text-orange-300 font-bold mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Jett Optics (&quot;jettoptics.ai&quot;), including the DOJO developer platform, JOE Agent SDK, and any associated services (collectively, the &quot;Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-lg text-orange-300 font-bold mb-3">2. Description of Service</h2>
            <p>Jett Optics provides spatial encryption technology, gaze-based biometric authentication (AGT tensor system), decentralized physical infrastructure (DePIN) node participation, and the $OPTX token ecosystem on Solana devnet. The Service includes:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-400">
              <li>DOJO — Developer training and gaze calibration platform</li>
              <li>JOE Agent — AI assistant SDK with spatial context</li>
              <li>JettChat — Real-time encrypted communication</li>
              <li>DePIN Node — Gaze validation node participation</li>
              <li>$OPTX — Utility token for platform access and staking</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg text-orange-300 font-bold mb-3">3. Accounts and Authentication</h2>
            <p>You may register using email, social login (Google, X/Twitter), or Web3 wallet connection. You are responsible for maintaining the security of your account credentials, gaze biometric data, and wallet private keys. Jett Optics never stores your wallet private keys.</p>
          </section>

          <section>
            <h2 className="text-lg text-orange-300 font-bold mb-3">4. Subscriptions and Payments</h2>
            <p>Paid subscriptions (MOJO, DOJO, UNLIMITED) are billed monthly through Stripe. You may cancel at any time. Refunds are handled on a case-by-case basis. Subscription tiers determine access to features including gaze training, API keys, DePIN node rewards, and priority support.</p>
          </section>

          <section>
            <h2 className="text-lg text-orange-300 font-bold mb-3">5. Gaze Biometric Data</h2>
            <p>Gaze calibration data is processed locally on your device or on Jett Optics edge infrastructure (Jetson Orin Nano). Gaze signatures are one-way hashed before any on-chain storage. Raw gaze data is never transmitted to cloud servers. You retain ownership of your biometric data and may request deletion at any time.</p>
          </section>

          <section>
            <h2 className="text-lg text-orange-300 font-bold mb-3">6. $OPTX Token</h2>
            <p>$OPTX is currently deployed on Solana devnet for testing purposes. $OPTX is a utility token and does not represent any ownership, equity, or investment interest in Jett Optics. Token economics, staking rewards, and DePIN validation mechanisms are subject to change during the devnet phase.</p>
          </section>

          <section>
            <h2 className="text-lg text-orange-300 font-bold mb-3">7. Acceptable Use</h2>
            <p>You agree not to: reverse engineer the spatial encryption algorithms; attempt to extract raw gaze data from on-chain attestations; use the Service for unlawful purposes; circumvent subscription restrictions; or abuse the JOE Agent API rate limits.</p>
          </section>

          <section>
            <h2 className="text-lg text-orange-300 font-bold mb-3">8. Intellectual Property</h2>
            <p>The JOULE (Joule Encryption Temporal Template) system, AGT (Augmented Gaze Tensor) classification, and all associated algorithms are proprietary to Jett Optics. The JOE Agent SDK is provided under license for use within the platform.</p>
          </section>

          <section>
            <h2 className="text-lg text-orange-300 font-bold mb-3">9. Limitation of Liability</h2>
            <p>Jett Optics is provided &quot;as is&quot; without warranties of any kind. We are not liable for any damages arising from use of the Service, including but not limited to loss of $OPTX tokens, gaze data processing errors, or DePIN node downtime. Total liability shall not exceed the amount paid by you in the preceding 12 months.</p>
          </section>

          <section>
            <h2 className="text-lg text-orange-300 font-bold mb-3">10. Termination</h2>
            <p>We may suspend or terminate your access for violation of these terms. Upon termination, your gaze biometric data will be deleted within 30 days. On-chain attestations are immutable and cannot be removed from Solana.</p>
          </section>

          <section>
            <h2 className="text-lg text-orange-300 font-bold mb-3">11. Changes to Terms</h2>
            <p>We may update these terms at any time. Continued use of the Service after changes constitutes acceptance. Material changes will be communicated via email or in-app notification.</p>
          </section>

          <section>
            <h2 className="text-lg text-orange-300 font-bold mb-3">12. Contact</h2>
            <p>For questions about these terms, contact: <a href="mailto:founder@jettoptics.ai" className="text-orange-400 hover:text-orange-300">founder@jettoptics.ai</a></p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-zinc-800 text-center">
          <p className="text-xs text-zinc-600 font-mono">Jett Optics Inc. &copy; {new Date().getFullYear()} &middot; Spatial Encryption</p>
          <div className="flex gap-4 justify-center mt-3">
            <Link href="/privacy" className="text-xs text-zinc-500 hover:text-orange-400 font-mono">Privacy Policy</Link>
            <Link href="/" className="text-xs text-zinc-500 hover:text-orange-400 font-mono">Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
