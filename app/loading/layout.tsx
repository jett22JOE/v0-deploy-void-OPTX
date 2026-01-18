import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Waitlist | Jett Optics",
  description: "Join the Jett Optics waitlist for early access",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function LoadingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
