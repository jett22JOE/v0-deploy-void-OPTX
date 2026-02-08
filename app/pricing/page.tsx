"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSafeAuth, useSafeUser } from "@/lib/hooks/use-safe-auth"
import Link from "next/link"
import Image from "next/image"
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background"
import { AnimatedMetalBorder } from "@/components/ui/animated-metal-border"
import {
  Check,
  ArrowLeft,
  Loader2,
  Zap,
  Shield,
  Crown,
  Eye,
  Cpu,
  Globe,
  Lock,
  BarChart3,
  Headphones,
  Server,
  Sparkles,
} from "lucide-react"

const tiers = [
  {
    id: "mojo",
    name: "MOJO",
    clerkKey: "mojo_user",
    price: 8.88,
    annual: 96.0,
    trial: "7-day free trial",
    description: "Mobile gaze auth + JOE Agent access",
    icon: Zap,
    priceId: process.env.NEXT_PUBLIC_STRIPE_MOJO_PRICE_ID || "",
    featured: false,
    features: [
      { text: "MOJO mobile gaze capture", icon: Eye },
      { text: "JOE Agent SDK (mobile)", icon: Cpu },
      { text: "Basic spatial encryption keys", icon: Lock },
      { text: "Analytics dashboard", icon: BarChart3 },
      { text: "Community Discord support", icon: Headphones },
      { text: "Devnet $OPTX staking rewards", icon: Sparkles },
    ],
  },
  {
    id: "dojo",
    name: "DOJO",
    clerkKey: "dojo_user",
    price: 28.88,
    annual: 28.08,
    trial: null,
    description: "Web training platform + full gaze pipeline",
    icon: Shield,
    priceId: process.env.NEXT_PUBLIC_STRIPE_DOJO_PRICE_ID || "",
    featured: true,
    features: [
      { text: "DOJO web gaze training", icon: Eye },
      { text: "Advanced JOE Agent (custom prompts)", icon: Cpu },
      { text: "Unlimited encryption keys", icon: Lock },
      { text: "Detailed analytics + exports", icon: BarChart3 },
      { text: "Priority support (24h SLA)", icon: Headphones },
      { text: "DePIN node access + relay", icon: Server },
    ],
  },
  {
    id: "unlimited",
    name: "UNLIMITED",
    clerkKey: "unlimited_user",
    price: 88.88,
    annual: 88.08,
    trial: null,
    description: "Full platform access with white-label deployment",
    icon: Crown,
    priceId: process.env.NEXT_PUBLIC_STRIPE_UNLIMITED_PRICE_ID || "",
    featured: false,
    features: [
      { text: "MOJO + DOJO full platform access", icon: Eye },
      { text: "White-label JOE Agent", icon: Cpu },
      { text: "Custom spatial encryption models", icon: Lock },
      { text: "Enterprise dashboards + audit logs", icon: BarChart3 },
      { text: "Dedicated support (2h SLA)", icon: Headphones },
      { text: "Full DePIN node hosting + rewards", icon: Server },
    ],
  },
]

export default function PricingPage() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useSafeAuth()
  const { user } = useSafeUser()
  const [loadingTier, setLoadingTier] = useState<string | null>(null)
  const [isAnnual, setIsAnnual] = useState(false)

  const handleSubscribe = async (tier: (typeof tiers)[number]) => {
    if (!isSignedIn) {
      router.push("/optx-login")
      return
    }

    if (!tier.priceId) {
      // No price ID configured yet — go to contact
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })
      return
    }

    setLoadingTier(tier.id)
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: tier.priceId,
          clerkUserId: user?.id,
          customerEmail: user?.primaryEmailAddress?.emailAddress,
        }),
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error("Checkout error:", data.error)
      }
    } catch (err) {
      console.error("Failed to create checkout:", err)
    } finally {
      setLoadingTier(null)
    }
  }

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
        <DottedGlowBackground
          className="pointer-events-none z-[1]"
          opacity={0.6}
          gap={14}
          radius={1.5}
          color="rgba(181, 82, 0, 0.4)"
          glowColor="rgba(181, 82, 0, 0.9)"
          darkColor="rgba(181, 82, 0, 0.4)"
          darkGlowColor="rgba(181, 82, 0, 0.9)"
          backgroundOpacity={0}
        />
        <div className="text-center z-10">
          <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto mb-4" />
          <p className="font-mono text-sm text-white/60">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col overflow-auto">
      <DottedGlowBackground
        className="pointer-events-none z-[1]"
        opacity={0.6}
        gap={14}
        radius={1.5}
        color="rgba(181, 82, 0, 0.4)"
        glowColor="rgba(181, 82, 0, 0.9)"
        darkColor="rgba(181, 82, 0, 0.4)"
        darkGlowColor="rgba(181, 82, 0, 0.9)"
        backgroundOpacity={0}
      />

      {/* Header */}
      <div className="relative flex justify-between items-center p-6 z-20">
        <Link href="/" className="group flex items-center gap-2">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <span className="relative flex h-full w-full">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <Image
                src="/images/astroknots-logo.png"
                alt="OPTX Logo"
                width={32}
                height={32}
                className="relative inline-flex rounded-full object-contain"
              />
            </span>
          </div>
          <span className="font-mono text-xs tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
            OPTX
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/dev"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Dev Access
          </Link>
          {isSignedIn && user && (
            <span className="font-mono text-xs text-zinc-500">
              {user.primaryEmailAddress?.emailAddress?.split("@")[0]}
            </span>
          )}
          {isSignedIn ? (
            <Link
              href="/security"
              className="px-3 py-1.5 rounded-lg font-mono text-xs bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors border border-zinc-700"
            >
              Account
            </Link>
          ) : (
            <Link
              href="/optx-login"
              className="px-3 py-1.5 rounded-lg font-mono text-xs bg-accent text-white hover:bg-accent/90 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="relative z-10 text-center pt-8 pb-12 px-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Globe className="w-7 h-7 text-accent" />
          <h1
            className="font-mono text-3xl md:text-4xl tracking-widest text-white uppercase"
            style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
          >
            Choose Your{" "}
            <span className="bg-gradient-to-r from-accent via-orange-500 to-amber-400 bg-clip-text text-transparent">
              Lens
            </span>
          </h1>
        </div>
        <p className="font-mono text-sm text-zinc-500 max-w-md mx-auto mb-8">
          Subscribe to access the JOE spatial network. Build gaze-authenticated
          apps on DePIN infrastructure.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4">
          <span
            className={`font-mono text-xs transition-colors ${!isAnnual ? "text-white" : "text-zinc-500"}`}
          >
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative w-12 h-6 rounded-full transition-colors border ${
              isAnnual
                ? "bg-accent/30 border-accent/50"
                : "bg-zinc-800 border-zinc-700"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${
                isAnnual
                  ? "left-6 bg-accent"
                  : "left-0.5 bg-zinc-400"
              }`}
            />
          </button>
          <span
            className={`font-mono text-xs transition-colors ${isAnnual ? "text-white" : "text-zinc-500"}`}
          >
            Annual
          </span>
          {isAnnual && (
            <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-green-500/20 text-green-400 border border-green-500/30">
              SAVE
            </span>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="relative z-10 flex-1 px-4 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <AnimatedMetalBorder
              key={tier.id}
              containerClassName={`rounded-xl ${tier.featured ? "md:-mt-4 md:mb-0" : ""}`}
              borderWidth={tier.featured ? 3 : 2}
              borderRadius={12}
            >
              <div
                className={`p-6 rounded-xl flex flex-col h-full ${
                  tier.featured
                    ? "bg-gradient-to-b from-zinc-900/95 to-zinc-900/80 md:py-10"
                    : "bg-zinc-900/90"
                }`}
              >
                {/* Badges */}
                <div className="flex justify-center gap-2 mb-4 min-h-[24px]">
                  {tier.featured && (
                    <span className="px-3 py-1 rounded-full font-mono text-[10px] tracking-widest uppercase bg-accent/20 text-accent border border-accent/30">
                      Most Popular
                    </span>
                  )}
                  {tier.trial && (
                    <span className="px-3 py-1 rounded-full font-mono text-[10px] tracking-widest uppercase bg-green-500/15 text-green-400 border border-green-500/30">
                      {tier.trial}
                    </span>
                  )}
                </div>

                {/* Tier Header */}
                <div className="text-center mb-6">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                      tier.featured
                        ? "bg-accent/20 border border-accent/40"
                        : "bg-zinc-800 border border-zinc-700"
                    }`}
                  >
                    <tier.icon
                      className={`w-6 h-6 ${tier.featured ? "text-accent" : "text-zinc-400"}`}
                    />
                  </div>
                  <h2
                    className="font-mono text-xl tracking-widest text-white mb-1"
                    style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
                  >
                    {tier.name}
                  </h2>
                  <p className="font-mono text-[10px] text-zinc-500">
                    {tier.description}
                  </p>
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-mono text-4xl text-white font-bold">
                      ${isAnnual ? tier.annual.toFixed(2) : tier.price.toFixed(2)}
                    </span>
                    <span className="font-mono text-xs text-zinc-500">
                      /mo{isAnnual ? " (billed annually)" : ""}
                    </span>
                  </div>
                  {!isAnnual && tier.annual < tier.price && (
                    <p className="font-mono text-[10px] text-green-400/70 mt-1">
                      ${tier.annual.toFixed(2)}/mo billed annually
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="flex-1 space-y-3 mb-8">
                  {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          tier.featured ? "bg-accent/10" : "bg-zinc-800"
                        }`}
                      >
                        <feature.icon
                          className={`w-3 h-3 ${
                            tier.featured ? "text-accent" : "text-zinc-500"
                          }`}
                        />
                      </div>
                      <span className="font-mono text-xs text-zinc-300">
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleSubscribe(tier)}
                  disabled={loadingTier === tier.id}
                  className={`w-full py-3 rounded-lg font-mono text-sm tracking-wider transition-all flex items-center justify-center gap-2 ${
                    tier.featured
                      ? "bg-accent hover:bg-accent/90 text-white shadow-[0_0_20px_rgba(181,82,0,0.3)]"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                  }`}
                >
                  {loadingTier === tier.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {isSignedIn ? "Subscribe" : "Sign In to Subscribe"}
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </AnimatedMetalBorder>
          ))}
        </div>

        {/* Bottom Info */}
        <div className="max-w-5xl mx-auto mt-12 text-center space-y-4">
          <AnimatedMetalBorder
            containerClassName="rounded-xl inline-block"
            borderWidth={1}
            borderRadius={12}
          >
            <div className="bg-zinc-900/90 px-8 py-4 rounded-xl">
              <p className="font-mono text-xs text-zinc-400">
                All plans include{" "}
                <span className="text-accent">Devnet $OPTX staking</span> and{" "}
                <span className="text-accent">Solana wallet integration</span>.
                Cancel anytime.
              </p>
            </div>
          </AnimatedMetalBorder>

          <p className="font-mono text-[10px] text-zinc-600">
            $OPTX Mint: 4r9WoPsRjJzrYEuj6VdwowVrFZaXpu16Qt6xogcmdUXC
          </p>
          <p className="font-mono text-[10px] text-zinc-600">
            Powered by Stripe. Secured by spatial encryption.
          </p>
        </div>
      </div>

      {/* Noise overlay */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none z-[6]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
