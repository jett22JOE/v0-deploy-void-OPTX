"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSafeAuth, useSafeUser } from "@/lib/hooks/use-safe-auth"
import Link from "next/link"
import Image from "next/image"
import { STRIPE_PRICES } from "@/lib/stripe"
import {
  Check,
  ArrowLeft,
  Loader2,
  Zap,
  Shield,
  Crown,
  Globe,
} from "lucide-react"

const tiers = [
  {
    id: "mojo",
    name: "MOJO",
    price: "$8.88",
    interval: "/mo",
    priceId: STRIPE_PRICES.MOJO,
    description: "Mobile Jett Optics",
    trial: "7-day free trial",
    features: [
      "MOJO mobile gaze capture",
      "JOE Agent SDK (mobile)",
      "Basic spatial encryption keys",
      "Analytics dashboard",
      "Community Discord support",
      "Devnet $OPTX staking rewards",
    ],
    color: "blue",
    icon: Zap,
  },
  {
    id: "dojo",
    name: "DOJO",
    price: "$28.88",
    interval: "/6mo",
    priceId: STRIPE_PRICES.DOJO,
    description: "Developer Jett Optics",
    badge: "POPULAR",
    features: [
      "DOJO web gaze training",
      "Advanced JOE Agent (custom prompts)",
      "Unlimited encryption keys",
      "Detailed analytics + exports",
      "Priority support (24h SLA)",
      "DePIN node access + relay",
    ],
    color: "orange",
    icon: Shield,
  },
  {
    id: "unlimited",
    name: "UNLIMITED",
    price: "$88.88",
    interval: "/mo",
    priceId: STRIPE_PRICES.UNLIMITED,
    description: "Full platform access",
    features: [
      "MOJO + DOJO full platform access",
      "White-label JOE Agent",
      "Custom spatial encryption models",
      "Enterprise dashboards + audit logs",
      "Dedicated support (2h SLA)",
      "Full DePIN node hosting + rewards",
    ],
    color: "green",
    icon: Crown,
  },
]

const colorMap: Record<
  string,
  { border: string; badge: string; button: string; text: string }
> = {
  blue: {
    border: "border-blue-500/30 hover:border-blue-500/60",
    badge: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    button: "bg-blue-600 hover:bg-blue-500",
    text: "text-blue-400",
  },
  orange: {
    border: "border-orange-500/30 hover:border-orange-500/60",
    badge: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
    button: "bg-orange-600 hover:bg-orange-500",
    text: "text-orange-400",
  },
  green: {
    border: "border-green-500/30 hover:border-green-500/60",
    badge: "bg-green-500/20 text-green-400 border border-green-500/30",
    button: "bg-green-600 hover:bg-green-500",
    text: "text-green-400",
  },
}

export default function PricingPage() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useSafeAuth()
  const { user } = useSafeUser()
  const [loadingTier, setLoadingTier] = useState<string | null>(null)

  async function handleSubscribe(tier: (typeof tiers)[number]) {
    if (!isSignedIn || !user) {
      router.push("/optx-login")
      return
    }

    setLoadingTier(tier.id)
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: tier.priceId,
          clerkUserId: user.id,
          customerEmail: user.primaryEmailAddress?.emailAddress,
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || "Failed to create checkout session")
      }
    } catch {
      alert("Something went wrong. Please try again.")
    } finally {
      setLoadingTier(null)
    }
  }

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col overflow-auto">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <Link href="/" className="group flex items-center gap-2">
          <Image
            src="/images/astroknots-logo.png"
            alt="OPTX"
            width={28}
            height={28}
            className="rounded-full"
          />
          <span className="font-mono text-xs tracking-widest text-zinc-500 group-hover:text-white transition-colors">
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
              className="px-3 py-1.5 rounded-lg font-mono text-xs bg-orange-600 text-white hover:bg-orange-500 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="text-center pt-8 pb-12 px-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Globe className="w-7 h-7 text-orange-500" />
          <h1
            className="font-mono text-3xl md:text-4xl tracking-widest text-white uppercase"
            style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
          >
            Choose Your{" "}
            <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 bg-clip-text text-transparent">
              Augment
            </span>
          </h1>
        </div>
        <p className="font-mono text-sm text-zinc-500 max-w-md mx-auto">
          Subscribe to access the JOE spatial network. Build
          gaze-authenticated apps on DePIN infrastructure.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="flex-1 px-4 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const colors = colorMap[tier.color]

            return (
              <div
                key={tier.id}
                className={`rounded-xl border bg-zinc-900/80 p-6 flex flex-col transition-all duration-200 hover:shadow-lg hover:shadow-zinc-900/50 ${colors.border} ${
                  tier.badge ? "md:-mt-4 ring-1 ring-orange-500/20" : ""
                }`}
              >
                {/* Badges */}
                <div className="flex justify-center gap-2 mb-4 min-h-[24px]">
                  {tier.badge && (
                    <span
                      className={`px-3 py-1 rounded-full font-mono text-[10px] tracking-widest uppercase ${colors.badge}`}
                    >
                      {tier.badge}
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
                      tier.badge
                        ? "bg-orange-500/20 border border-orange-500/40"
                        : "bg-zinc-800 border border-zinc-700"
                    }`}
                  >
                    <tier.icon
                      className={`w-6 h-6 ${
                        tier.badge ? "text-orange-500" : "text-zinc-400"
                      }`}
                    />
                  </div>
                  <h2
                    className={`font-mono text-xl tracking-widest mb-1 ${colors.text}`}
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
                  <span
                    className={`font-mono text-4xl font-bold ${colors.text}`}
                  >
                    {tier.price}
                  </span>
                  <span className="font-mono text-xs text-zinc-500 ml-1">
                    {tier.interval}
                  </span>
                </div>

                {/* Features */}
                <div className="flex-1 space-y-2.5 mb-8">
                  {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check
                        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors.text}`}
                      />
                      <span className="font-mono text-xs text-zinc-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleSubscribe(tier)}
                  disabled={loadingTier === tier.id}
                  className={`w-full py-3 rounded-lg font-mono text-sm tracking-wider transition-all text-white flex items-center justify-center gap-2 disabled:opacity-50 ${colors.button}`}
                >
                  {loadingTier === tier.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isSignedIn ? (
                    "Subscribe"
                  ) : (
                    "Sign In to Subscribe"
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Bottom Info */}
        <div className="max-w-5xl mx-auto mt-12 text-center">
          <div className="inline-block bg-zinc-900/80 border border-orange-500/20 px-8 py-4 rounded-xl">
            <p className="font-mono text-xs text-zinc-400">
              All plans include{" "}
              <span className="text-orange-400">Devnet $OPTX staking</span> and{" "}
              <span className="text-orange-400">
                Solana wallet integration
              </span>
              . Cancel anytime.
            </p>
          </div>
          <p className="font-mono text-[10px] text-zinc-600 mt-4">
            Powered by Stripe. Secured by spatial encryption.
          </p>
        </div>
      </div>
    </div>
  )
}
