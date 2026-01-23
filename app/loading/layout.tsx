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

export default function LoadingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
