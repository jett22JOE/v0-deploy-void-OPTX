import Link from "next/link"

export const metadata = {
  title: "Privacy Policy | Jett Optics",
  description: "Privacy Policy for Jett Optics spatial encryption platform.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="text-orange-400 hover:text-orange-300 text-sm font-mono mb-8 inline-block">&larr; Back to Jett Optics</Link>

        <h1 className="text-3xl font-bold font-mono tracking-wider text-orange-400 mb-2">PRIVACY POLICY</h1>
        <p className="text-sm text-zinc-500 font-mono mb-12">Last updated: February 15, 2026</p>

        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed font-mono">
          <section>
            <h2 className="text-lg text-orange-300 font-bold mb-3">1. Our Privacy Commitment</h2>
            <p>Privacy is sacred. Jett Optics is built on the principle that your biometric data, gaze patterns, and personal information belong to you. We process data locally whenever possible and never sell your information to third parties.</p>
          </section>

          <section>
            <h2 className="text-lg text-orange-300 font-bold mb-3">2. Information We Collect</h2>

            <h3 className="text-sm text-orange-200 font-bold mt-4 mb-2">Account Information</h3>
            <p>When you register, we collect your email address, display name, and authentication provider details (Google, X/Twitter). This is managed by Clerk and stored according to their security practices.</p>

            <h3 className="text-sm text-orange-200 font-bold mt-4 mb-2">Gaze Biometric Data</h3>
            <p>During DOJO training, your webcam captures gaze position data. This data is:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-400">
              <li>Processed <strong>locally on your device</strong> using MediaPipe face mesh</li>
              <li>Classified into AGT tensors (COG/EMO/ENV) on-device</li>
              <li>One-way hashed before any network transmission</li>
              <li>Never stored as raw video or images</li>
              <li>Never sent to cloud servers for processing</li>
            </ul>

            <h3 className="text-sm text-orange-200 font-bold mt-4 mb-2">Wallet Information</h3>
            <p>If you connect a Solana wallet, we store only your public address. We never have access to your private keys or seed phrases.</p>

            <h3 className="text-sm text-orange-200 font-bold mt-4 mb-2">Usage Data</h3>
            <p>We collect anonymized usage analytics (page views, feature usage) via Vercel Analytics. No personal identifiers are included.</p>
          </section>

          <section>
            <h2 className="text-lg text-orange-300 font-bold mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1 text-zinc-400">
              <li>Authenticate your identity and manage subscriptions</li>
              <li>Generate gaze-based encryption keys (JOULE templates)</li>
              <li>Create on-chain attestations for DePIN validation</li>
              <li>Provide JOE Agent responses and spatial context</li>
              <li>Improve the Service and fix bugs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg text-orange-300 font-bold mb-3">4. Edge Processing</h2>
            <p>Jett Optics uses dedicated edge compute hardware for privacy-preserving AI inference. When gaze data is processed on our infrastructure:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-400">
              <li>Processing occurs on sovereign hardware (not shared cloud)</li>
              <li>Data is encrypted in transit via WireGuard tunnels</li>
              <li>No data is retained after processing completes</li>
              <li>Our database stores only hashed signatures, never raw biometrics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg text-orange-300 font-bold mb-3">5. On-Chain Data</h2>
            <p>Gaze attestations stored on Solana are:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-400">
              <li>One-way hashed (cannot be reversed to raw gaze data)</li>
              <li>Publicly visible on the blockchain (wallet address + hash only)</li>
              <li>Immutable once written (cannot be deleted from Solana)</li>
            </ul>
            <p className="mt-2">By creating an attestation, you consent to this permanent on-chain storage of your hashed gaze signature.</p>
          </section>

          <section>
            <h2 className="text-lg text-orange-300 font-bold mb-3">6. Third-Party Services</h2>
            <ul className="list-disc list-inside space-y-1 text-zinc-400">
              <li><strong>Clerk</strong> — Authentication and user management</li>
              <li><strong>Stripe</strong> — Payment processing (PCI-DSS compliant)</li>
              <li><strong>Vercel</strong> — Application hosting and analytics</li>
              <li><strong>Solana</strong> — Blockchain for attestations and $OPTX</li>
              <li><strong>xAI (Grok)</strong> — AI model for JOE Agent responses</li>
            </ul>
            <p className="mt-2">Each third party has their own privacy policy. We do not share your gaze biometric data with any third party.</p>
          </section>

          <section>
            <h2 className="text-lg text-orange-300 font-bold mb-3">7. Data Retention</h2>
            <ul className="list-disc list-inside space-y-1 text-zinc-400">
              <li>Account data: Retained while your account is active</li>
              <li>Gaze training data: Deleted after session ends (not stored)</li>
              <li>Gaze signatures: Stored as hashes until deletion request</li>
              <li>On-chain attestations: Permanent (blockchain immutability)</li>
              <li>Chat messages: Retained in encrypted storage, deletable on request</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg text-orange-300 font-bold mb-3">8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-400">
              <li>Access your personal data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Export your gaze training history</li>
              <li>Opt out of analytics tracking</li>
              <li>Revoke camera permissions at any time</li>
            </ul>
            <p className="mt-2">To exercise these rights, contact <a href="mailto:founder@jettoptics.ai" className="text-orange-400 hover:text-orange-300">founder@jettoptics.ai</a>.</p>
          </section>

          <section>
            <h2 className="text-lg text-orange-300 font-bold mb-3">9. Security</h2>
            <p>We employ industry-standard security measures including:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-400">
              <li>HTTPS/TLS encryption for all web traffic</li>
              <li>WireGuard encrypted tunnels for edge-to-cloud communication</li>
              <li>One-way hashing for biometric signatures</li>
              <li>Clerk-managed authentication with MFA support</li>
              <li>No plaintext storage of passwords or keys</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg text-orange-300 font-bold mb-3">10. Children</h2>
            <p>The Service is not intended for users under 13 years of age. We do not knowingly collect personal information from children.</p>
          </section>

          <section>
            <h2 className="text-lg text-orange-300 font-bold mb-3">11. Changes to This Policy</h2>
            <p>We may update this privacy policy periodically. Material changes will be communicated via email or in-app notification. Continued use after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-lg text-orange-300 font-bold mb-3">12. Contact</h2>
            <p>For privacy inquiries: <a href="mailto:founder@jettoptics.ai" className="text-orange-400 hover:text-orange-300">founder@jettoptics.ai</a></p>
            <p className="mt-1">Jett Optics Inc.</p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-zinc-800 text-center">
          <p className="text-xs text-zinc-600 font-mono">Jett Optics Inc. &copy; {new Date().getFullYear()} &middot; Privacy is Sacred</p>
          <div className="flex gap-4 justify-center mt-3">
            <Link href="/terms" className="text-xs text-zinc-500 hover:text-orange-400 font-mono">Terms of Service</Link>
            <Link href="/" className="text-xs text-zinc-500 hover:text-orange-400 font-mono">Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
