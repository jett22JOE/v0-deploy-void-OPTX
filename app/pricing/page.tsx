"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
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
  BrainCircuit,
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
    stakeAlt: "or stake 12 JTX",
    features: [
      "12 OPTX mints per month",
      "Jett Native keyboard",
      "Jett Augment customizations",
      "Jett Hub gaze keyboard + emoji packs",
      "JOE Agent SDK (mobile)",
      "Analytics dashboard",
      "Unlimited DOJO training sessions",
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
    stakeAlt: "or stake 444 JTX for 2x OPTX",
    features: [
      "222 OPTX mints per month (444 via JTX stake)",
      "Jett Augment customizations",
      "Custom emoji creation via gaze gestures",
      "Augment Net Graph — AR-navigable AGT knowledge graph",
      "Advanced JOE Agent (custom prompts)",
      "Priority Aaron Router access (24h SLA)",
      "DePIN node access + relay",
      "Unlimited DOJO training sessions",
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
    stakeAlt: "or stake 1,111 JTX for lifetime",
    features: [
      "Unlimited OPTX mints — no cap",
      "Full Jett Augment suite",
      "Full Augment Net Graph + AR navigation",
      "White-label JOE Agent",
      "Complete AGT tensor pipeline",
      "Founder-tier Aaron access (2h SLA)",
      "Governance voting rights",
      "Full DePIN node hosting + rewards",
      "Unlimited DOJO training sessions",
    ],
    color: "purple",
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
    border: "border-orange-500/40 hover:border-orange-500/70",
    badge: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
    button: "bg-orange-600 hover:bg-orange-500",
    text: "text-orange-400",
  },
  purple: {
    border: "border-purple-500/30 hover:border-purple-500/60",
    badge: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    button: "bg-purple-600 hover:bg-purple-500",
    text: "text-purple-400",
  },
}

// Deterministic star positions (avoid SSR mismatch)
const STAR_POSITIONS = Array.from({ length: 40 }, (_, i) => ({
  x: ((i * 37 + 13) % 100),
  y: ((i * 53 + 7) % 100),
  delay: ((i * 17) % 30) / 10,
  duration: 2 + ((i * 23) % 30) / 10,
}))

const SHOOTING_STARS = Array.from({ length: 6 }, (_, i) => ({
  startX: ((i * 29 + 5) % 80) + 10,
  startY: ((i * 41 + 3) % 40),
  angle: 25 + ((i * 13) % 20),
  delay: ((i * 31) % 50) / 10,
  duration: 2.5 + ((i * 19) % 20) / 10,
  length: 40 + ((i * 23) % 40),
}))

export default function PricingPage() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useSafeAuth()
  const { user } = useSafeUser()
  const [loadingTier, setLoadingTier] = useState<string | null>(null)
  const [currentTier, setCurrentTier] = useState<string | null>(null)

  // Check current subscription on mount
  useEffect(() => {
    if (!isSignedIn) return
    fetch("/api/verify-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.status === "active" && d.tier) {
          setCurrentTier(d.tier)
        }
      })
      .catch(() => {})
  }, [isSignedIn])

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
      <div className="fixed inset-0 z-[100] bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0f] flex flex-col overflow-auto">

      {/* ─── Starfield Background ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Pulsing stars */}
        {STAR_POSITIONS.map((star, i) => (
          <div
            key={`star-${i}`}
            className="absolute w-0.5 h-0.5 bg-orange-400/30 rounded-full animate-pulse"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
        {/* Shooting stars */}
        {SHOOTING_STARS.map((s, i) => (
          <div key={`shoot-${i}`} className="absolute" style={{ left: `${s.startX}%`, top: `${s.startY}%` }}>
            <div
              className="pricing-shooting-star"
              style={{
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.duration}s`,
                width: `${s.length}px`,
                transform: `rotate(${s.angle}deg)`,
              }}
            />
          </div>
        ))}
        <style>{`
          .pricing-shooting-star {
            height: 1px;
            background: linear-gradient(90deg, rgba(251,146,60,0), rgba(251,146,60,0.6), rgba(251,146,60,0));
            animation: pricing-shoot linear infinite;
            opacity: 0;
          }
          @keyframes pricing-shoot {
            0% { opacity: 0; transform: translateX(-100px); }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { opacity: 0; transform: translateX(200px); }
          }
          @keyframes dojo-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(251,146,60,0.1), 0 0 40px rgba(251,146,60,0.05); }
            50% { box-shadow: 0 0 30px rgba(251,146,60,0.25), 0 0 60px rgba(251,146,60,0.1); }
          }
          .dojo-card-glow {
            animation: dojo-glow 3s ease-in-out infinite;
          }
        `}</style>
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center p-6">
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
            href="/dojo"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            DOJO
          </Link>
          {currentTier && (
            <span className={`px-2 py-1 rounded-md font-mono text-[10px] uppercase tracking-wider ${
              currentTier === "unlimited" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" :
              currentTier === "dojo" ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" :
              "bg-blue-500/20 text-blue-400 border border-blue-500/30"
            }`}>
              {currentTier}
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
              className="px-3 py-1.5 rounded-lg font-mono text-xs bg-orange-600 text-white hover:bg-orange-500 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="relative z-10 text-center pt-8 pb-12 px-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <BrainCircuit className="w-7 h-7 text-orange-500" />
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
      <div className="relative z-10 flex-1 px-4 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const colors = colorMap[tier.color]
            const isDojo = tier.id === "dojo"

            return (
              <div
                key={tier.id}
                className={`rounded-xl border bg-zinc-900/80 backdrop-blur-sm p-6 flex flex-col transition-all duration-300 ${colors.border} ${
                  isDojo ? "md:-mt-4 ring-1 ring-orange-500/30 dojo-card-glow" : ""
                } ${tier.id === "unlimited" ? "hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]" : ""}`}
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
                    <span className="px-3 py-1 rounded-full font-mono text-[10px] tracking-widest uppercase bg-purple-500/15 text-purple-400 border border-purple-500/30">
                      {tier.trial}
                    </span>
                  )}
                </div>

                {/* Tier Header */}
                <div className="text-center mb-6">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-all duration-300 ${
                      isDojo
                        ? "bg-orange-500/20 border border-orange-500/40"
                        : tier.id === "unlimited"
                          ? "bg-purple-500/15 border border-purple-500/30"
                          : "bg-zinc-800 border border-zinc-700"
                    }`}
                  >
                    <tier.icon
                      className={`w-6 h-6 ${
                        isDojo ? "text-orange-500" : tier.id === "unlimited" ? "text-purple-400" : "text-zinc-400"
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
                <div className="text-center mb-2">
                  <span
                    className={`font-mono text-4xl font-bold ${colors.text}`}
                  >
                    {tier.price}
                  </span>
                  <span className="font-mono text-xs text-zinc-500 ml-1">
                    {tier.interval}
                  </span>
                </div>

                {/* Stake alternative */}
                {tier.stakeAlt && (
                  <div className="text-center mb-6">
                    <Link href="/stake" className="font-mono text-[10px] text-orange-400/60 hover:text-orange-400 transition-colors">
                      {tier.stakeAlt} →
                    </Link>
                  </div>
                )}

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
                  onClick={() => currentTier !== tier.id && handleSubscribe(tier)}
                  disabled={loadingTier === tier.id}
                  className={`w-full py-3 rounded-lg font-mono text-sm tracking-wider transition-all text-white flex items-center justify-center gap-2 disabled:opacity-50 ${colors.button}`}
                >
                  {loadingTier === tier.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isSignedIn ? (
                    currentTier === tier.id ? "Current Plan" : "Subscribe"
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
          <div className="inline-block bg-zinc-900/80 border border-orange-500/20 px-8 py-4 rounded-xl backdrop-blur-sm">
            <p className="font-mono text-xs text-zinc-400">
              All plans include{" "}
              <span className="text-orange-400">Devnet $OPTX staking</span>,{" "}
              <span className="text-orange-400">Solana wallet integration</span>, and{" "}
              <span className="text-orange-400">unlimited DOJO training sessions</span>.
              Cancel anytime.
            </p>
          </div>
          <p className="font-mono text-[10px] text-zinc-600 mt-3">
            Prefer staking?{" "}
            <Link href="/stake" className="text-orange-400/60 hover:text-orange-400 transition-colors">
              Stake $JTX instead →
            </Link>
          </p>
          <p className="font-mono text-[10px] text-zinc-600 mt-1">
            Powered by Stripe. Secured by spatial encryption.
          </p>
        </div>
      </div>
    </div>
  )
}
