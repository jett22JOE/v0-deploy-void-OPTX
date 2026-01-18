import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication | Jett Optics",
  description: "Completing authentication",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function SSOCallbackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
