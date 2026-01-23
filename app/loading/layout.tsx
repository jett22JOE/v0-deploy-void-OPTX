import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Join Waitlist | Jett Optics - Spatial Encryption",
  description: "Join the Jett Optics waitlist to get early access to our revolutionary spatial encryption technology using AGT gaze tensors and Markov chain cryptography.",
  alternates: {
    canonical: "https://jettoptics.ai/loading",
  },
  openGraph: {
    title: "Join Waitlist | Jett Optics",
    description: "Get early access to revolutionary spatial encryption technology for Web3 and DePIN networks.",
    url: "https://jettoptics.ai/loading",
  },
}

// JSON-LD schema for the waitlist page
const waitlistSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Join Jett Optics Waitlist",
  description: "Sign up for early access to Jett Optics spatial encryption technology",
  url: "https://jettoptics.ai/loading",
  isPartOf: {
    "@type": "WebSite",
    name: "Jett Optics",
    url: "https://jettoptics.ai",
  },
  about: {
    "@type": "Product",
    name: "Jett Optics Spatial Encryption",
    description: "Post-quantum biometric authentication using AGT gaze tensors and Markov chain cryptography for Web3 and DePIN networks.",
  },
}

export default function LoadingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(waitlistSchema) }}
      />
      {/* SEO content for crawlers - visually hidden but crawlable */}
      <div className="sr-only" aria-hidden="true">
        <h1>Join the Jett Optics Waitlist</h1>
        <p>
          Get early access to revolutionary spatial encryption technology. Jett Optics pioneers
          post-quantum biometric authentication using AGT (Adaptive Gaze Tensor) technology and
          Markov chain cryptography for Web3 and DePIN networks.
        </p>
        <p>
          Sign up now to be among the first to experience gaze-based encryption, proof-of-attention
          protocols, and quantum-resistant security on the Solana blockchain.
        </p>
      </div>
      {children}
    </>
  )
}
