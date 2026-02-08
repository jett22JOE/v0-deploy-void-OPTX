"use client"

// Force dynamic rendering to avoid SSR issues with Clerk/Convex
export const dynamic = 'force-dynamic'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSafeAuth, useSafeUser, useSafeQuery } from "@/lib/hooks/use-safe-auth"
import Link from "next/link"
import Image from "next/image"
import { api } from "@/convex/_generated/api"
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background"
import { AnimatedMetalBorder } from "@/components/ui/animated-metal-border"
import { Check, X, Wallet, Eye, CreditCard, Shield, ArrowRight, Loader2, Clock } from "lucide-react"

export default function DevPage() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useSafeAuth()
  const { user } = useSafeUser()

  // Get dev status from Convex
  const devStatus = useSafeQuery(
    api.dev.getUserDevStatus,
    user?.id ? { clerkUserId: user.id } : "skip"
  )

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/optx-login")
    }
  }, [isLoaded, isSignedIn, router])

  // Loading state
  if (!isLoaded || !isSignedIn) {
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

  const hasSubscription = devStatus?.stripeStatus === "active"

  const steps = [
    {
      id: "stripe",
      label: "Subscription",
      description: "Active subscription required for dev access",
      icon: CreditCard,
      complete: hasSubscription,
      status: hasSubscription ? "Active" : "Inactive",
      action: hasSubscription ? null : "/pricing",
      actionLabel: "Subscribe",
      comingSoon: false,
    },
    {
      id: "wallet",
      label: "Wallet Connection",
      description: "Connect Phantom or OKX wallet on Solana",
      icon: Wallet,
      complete: false,
      status: "Coming soon",
      action: null,
      actionLabel: null,
      comingSoon: true,
    },
    {
      id: "gaze",
      label: "Gaze Verification",
      description: "On-chain gaze attestation via DOJO training",
      icon: Eye,
      complete: false,
      status: "Coming soon",
      action: null,
      actionLabel: null,
      comingSoon: true,
    },
  ]

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-auto">
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
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-6 z-20">
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
          {user && (
            <span className="font-mono text-xs text-zinc-500">
              {user.primaryEmailAddress?.emailAddress?.split("@")[0]}
            </span>
          )}
          <Link
            href="/security"
            className="px-3 py-1.5 rounded-lg font-mono text-xs bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors border border-zinc-700"
          >
            Account
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 max-w-lg w-full px-4 py-24">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-accent" />
            <h1
              className="font-mono text-2xl md:text-3xl tracking-widest text-white uppercase"
              style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
            >
              Dev Access
            </h1>
          </div>
          <p className="font-mono text-xs text-zinc-500 max-w-sm">
            Subscribe to get dev access and help us build the JOE model on Devnet.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full transition-colors ${
                  step.complete
                    ? "bg-green-500"
                    : step.comingSoon
                      ? "bg-yellow-500/50"
                      : "bg-zinc-700"
                }`}
              />
              {index < steps.length - 1 && (
                <div
                  className={`w-8 h-0.5 transition-colors ${
                    step.complete
                      ? "bg-green-500"
                      : step.comingSoon
                        ? "bg-yellow-500/30"
                        : "bg-zinc-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Steps */}
        <AnimatedMetalBorder
          containerClassName="rounded-xl w-full"
          borderWidth={2}
          borderRadius={12}
        >
          <div className="bg-zinc-900/90 p-4 rounded-xl space-y-3">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                  step.complete
                    ? "bg-green-500/10 border-green-500/30"
                    : step.comingSoon
                      ? "bg-yellow-500/5 border-yellow-500/20"
                      : "bg-zinc-800/50 border-zinc-700"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.complete
                      ? "bg-green-500/20"
                      : step.comingSoon
                        ? "bg-yellow-500/10"
                        : "bg-zinc-700"
                  }`}
                >
                  <step.icon
                    className={`w-5 h-5 ${
                      step.complete
                        ? "text-green-400"
                        : step.comingSoon
                          ? "text-yellow-400/60"
                          : "text-zinc-400"
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-sm ${step.comingSoon ? "text-zinc-400" : "text-white"}`}>
                      {step.label}
                    </span>
                    {step.complete ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : step.comingSoon ? (
                      <Clock className="w-3.5 h-3.5 text-yellow-400/60" />
                    ) : (
                      <X className="w-4 h-4 text-zinc-500" />
                    )}
                  </div>
                  <p className="font-mono text-[10px] text-zinc-500">{step.description}</p>
                  <p
                    className={`font-mono text-[10px] mt-1 ${
                      step.complete
                        ? "text-green-400"
                        : step.comingSoon
                          ? "text-yellow-400/60"
                          : "text-zinc-400"
                    }`}
                  >
                    {step.status}
                  </p>
                </div>

                {step.comingSoon && (
                  <span className="px-2 py-1 rounded-md font-mono text-[10px] bg-yellow-500/10 text-yellow-400/80 border border-yellow-500/20">
                    SOON
                  </span>
                )}

                {step.action && (
                  <Link
                    href={step.action}
                    className="px-3 py-1.5 rounded-md font-mono text-xs bg-accent hover:bg-accent/90 text-white transition-colors flex items-center gap-1"
                  >
                    {step.actionLabel}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </AnimatedMetalBorder>

        {/* Dev Access Status */}
        <AnimatedMetalBorder
          containerClassName="rounded-xl w-full"
          borderWidth={2}
          borderRadius={12}
        >
          <div
            className={`p-6 rounded-xl text-center ${
              hasSubscription
                ? "bg-gradient-to-br from-green-500/20 to-accent/20"
                : "bg-zinc-900/90"
            }`}
          >
            {hasSubscription ? (
              <>
                <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="font-mono text-lg text-green-400 mb-2">Dev Access Granted</h2>
                <p className="font-mono text-xs text-zinc-400 mb-4">
                  You have dev access. Wallet connection + gaze verification coming soon on Devnet.
                </p>
                <p className="font-mono text-[10px] text-zinc-500 mb-4">
                  Program: 91SqqYLMi5zNsfMab6rnvipwJhDpN4FEMSLgu8F3bbGq
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-zinc-500" />
                </div>
                <h2 className="font-mono text-lg text-zinc-300 mb-2">Subscribe for Dev Access</h2>
                <p className="font-mono text-xs text-zinc-500 mb-4">
                  Subscribe to help us build the JOE model on Devnet!
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-accent hover:bg-accent/90 text-white font-mono text-sm transition-colors"
                >
                  View Plans
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </AnimatedMetalBorder>

        {/* Devnet Info */}
        <div className="w-full text-center">
          <p className="font-mono text-[10px] text-zinc-600">
            $OPTX Mint: 4r9WoPsRjJzrYEuj6VdwowVrFZaXpu16Qt6xogcmdUXC
          </p>
        </div>
      </div>

      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none z-[6]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
