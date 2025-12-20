import type React from "react"
import type { Metadata, Viewport } from "next"
import { Orbitron, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ClerkProviderWrapper } from "@/components/clerk-provider-wrapper"
import { ConvexClientProvider } from "@/components/convex-provider"
import { Toaster } from "sonner"
import { ResizeObserverFix } from "@/components/resize-observer-fix"
import "./globals.css"

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "JOE AI | DePIN - Spatial Encryption",
  description: "Quantum-resistant, hands-free optical encryption technology. Join the waitlist for early access to the future of secure communication.",
  keywords: ["quantum encryption", "optical security", "spatial encryption", "JOE AI", "DePIN", "quantum-resistant"],
  authors: [{ name: "JOE AI" }],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "JOE AI | DePIN - Spatial Encryption",
    description: "Quantum-resistant, hands-free optical encryption technology.",
    type: "website",
    siteName: "JOE AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "JOE AI | DePIN - Spatial Encryption",
    description: "Quantum-resistant, hands-free optical encryption technology.",
  },
}

export const viewport: Viewport = {
  themeColor: "#1a1a1a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${orbitron.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased overflow-x-hidden">
        <ClerkProviderWrapper>
          <ConvexClientProvider>
            <ResizeObserverFix />
            <div className="noise-overlay" />
            {children}
            <Toaster position="bottom-right" />
            <Analytics />
          </ConvexClientProvider>
        </ClerkProviderWrapper>
      </body>
    </html>
  )
}
