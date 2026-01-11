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
  title: "Jett Optics | Spatial Encryption & Gaze-Based Authentication | DePIN",
  description: "Pioneer of spatial encryption using Adaptive Gaze Tensor authentication and neuromorphic optical security. Post-quantum biometric authentication for Web3 and DePIN networks. Patent-pending eye-tracking cryptography.",
  keywords: [
    "spatial encryption",
    "gaze authentication",
    "gaze tensor authentication",
    "neuromorphic optical security",
    "neuromorphic security",
    "DePIN biometric",
    "eye tracking blockchain",
    "adaptive gaze tensor",
    "optical encryption authentication",
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
    "$JTX token",
    "Jett Optics",
    "spatial security",
    "quantum-resistant encryption",
    "Web3 authentication",
    "eye-tracking neuromorphic encryption",
  ],
  authors: [{ name: "Jett Optics", url: "https://jettoptics.ai" }],
  creator: "Jett Optics",
  publisher: "Jett Optics",
  metadataBase: new URL("https://jettoptics.ai"),
  alternates: {
    canonical: "https://jettoptics.ai",
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
    url: "https://jettoptics.ai",
    siteName: "Jett Optics",
    title: "Jett Optics | Spatial Encryption & Gaze-Based Authentication | DePIN",
    description: "Pioneer of spatial encryption using Adaptive Gaze Tensor authentication and neuromorphic optical security. Post-quantum biometric authentication for Web3 and DePIN networks.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Jett Optics - Spatial Encryption for the Decentralized Future",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@jettoptx",
    creator: "@jettoptx",
    title: "Jett Optics | Spatial Encryption & Gaze-Based Authentication",
    description: "Post-quantum security using Adaptive Gaze Tensors and neuromorphic optical encryption. Proof-of-attention on Solana. $JTX",
    images: ["/twitter-image"],
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
  name: "Jett Optics LLC",
  legalName: "Jett Optics LLC",
  alternateName: ["JettOptics", "Jett Optics"],
  url: "https://jettoptics.ai",
  logo: "https://jettoptics.ai/icons/lightLOGOjettoptics.jpeg",
  image: "https://jettoptics.ai/opengraph-image",
  description: "Pioneer of spatial encryption using Adaptive Gaze Tensor authentication and neuromorphic optical security. Post-quantum biometric authentication for Web3 and DePIN networks.",
  slogan: "Spatial Encryption for the Decentralized Future",
  foundingDate: "2024",
  founder: {
    "@type": "Person",
    name: "Joshua Martinez",
  },
  knowsAbout: [
    "Spatial Encryption",
    "Gaze Tensor Authentication",
    "Neuromorphic Optical Security",
    "DePIN Biometric",
    "Eye Tracking Blockchain",
    "Post-Quantum Cryptography",
  ],
  sameAs: [
    "https://twitter.com/jettoptx",
    "https://github.com/jett22JOE",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    url: "https://jettoptics.ai",
  },
}

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Jett Optics",
  url: "https://jettoptics.ai",
  description: "Spatial encryption for Web3 and DePIN networks using Adaptive Gaze Tensor authentication",
  publisher: {
    "@type": "Organization",
    name: "Jett Optics LLC",
  },
  potentialAction: {
    "@type": "SearchAction",
    target: "https://jettoptics.ai/?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
}

// JSON-LD Schema for SoftwareApplication
const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Jett Optics Spatial Encryption Platform",
  applicationCategory: "SecurityApplication",
  operatingSystem: "Web, iOS, Android",
  description: "Adaptive Gaze Tensor authentication platform providing neuromorphic optical security and post-quantum biometric authentication for Web3 and DePIN networks.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  creator: {
    "@type": "Organization",
    name: "Jett Optics LLC",
    url: "https://jettoptics.ai",
  },
  featureList: [
    "Spatial Encryption",
    "Gaze Tensor Authentication",
    "Neuromorphic Optical Security",
    "Post-Quantum Cryptography",
    "DePIN Integration",
    "Proof-of-Attention Protocol",
    "$JTX Token Rewards",
  ],
  keywords: "spatial encryption, gaze authentication, neuromorphic security, DePIN biometric, eye tracking blockchain",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
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
