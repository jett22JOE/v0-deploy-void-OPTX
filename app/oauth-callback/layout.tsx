import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication | Jett Optics",
  description: "Completing OAuth authentication",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function OAuthCallbackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
