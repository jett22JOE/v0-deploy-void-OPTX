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
  title: "Jett Optics | Spatial Encryption | DePIN",
  description: "Pioneer of spatial encryption using AGT gaze tensors and Markov chain cryptography. Post-quantum biometric authentication for Web3 and DePIN networks. $OPTX token.",
  keywords: [
    "spatial encryption",
    "DePIN",
    "gaze-based encryption",
    "AGT tensors",
    "adaptive gaze tensors",
    "proof-of-attention",
    "post-quantum cryptography",
    "Markov chain cryptography",
    "biometric authentication",
    "eye tracking security",
    "Solana DePIN",
    "$OPTX token",
    "Jett Optics",
    "spatial security",
    "quantum-resistant encryption",
    "Web3 authentication",
  ],
  authors: [{ name: "Jett Optics", url: "https://www.jettoptics.ai" }],
  creator: "Jett Optics",
  publisher: "Jett Optics",
  metadataBase: new URL("https://www.jettoptics.ai"),
  alternates: {
    canonical: "https://www.jettoptics.ai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.jettoptics.ai",
    siteName: "Jett Optics",
    title: "Jett Optics | Spatial Encryption | DePIN",
    description: "Pioneer of spatial encryption using AGT gaze tensors and Markov chain cryptography. Post-quantum biometric authentication for Web3 and DePIN.",
    images: [
      {
        url: "/icons/lightLOGOjettoptics.jpeg",
        width: 1200,
        height: 1200,
        alt: "Jett Optics - Optical Spatial Encryption Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@jettoptx",
    creator: "@jettoptx",
    title: "Jett Optics | Spatial Encryption | DePIN",
    description: "Post-quantum security using AGT gaze tensors and Markov chains. Proof-of-attention on Solana. $OPTX",
    images: ["/icons/lightLOGOjettoptics.jpeg"],
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  category: "technology",
}

export const viewport: Viewport = {
  themeColor: "#b55200",
  width: "device-width",
  initialScale: 1,
}

// JSON-LD Schema for Organization
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Jett Optics",
  alternateName: "JettOptics",
  url: "https://www.jettoptics.ai",
  logo: "https://www.jettoptics.ai/icons/lightLOGOjettoptics.jpeg",
  description: "Pioneer of spatial encryption using AGT gaze tensors and Markov chain cryptography for DePIN networks.",
  foundingDate: "2024",
  sameAs: [
    "https://twitter.com/jettoptx",
    "https://github.com/jett22JOE",
    "https://share.google/DXSrM5IAmV9bOMxgK",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    url: "https://www.jettoptics.ai",
  },
}

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Jett Optics",
  url: "https://www.jettoptics.ai",
  description: "Spatial encryption for Web3 and DePIN networks",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://www.jettoptics.ai/?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${orbitron.variable} ${geistMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
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
