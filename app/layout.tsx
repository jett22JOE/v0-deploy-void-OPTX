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
  title: "AI-Native Product Builder | Portfolio",
  description: "System Architect & Interface Designer crafting intelligent digital experiences",
    generator: 'v0.app'
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
