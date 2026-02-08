"use client"

// Force dynamic rendering to avoid SSR issues with Clerk/Convex
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { UserProfile } from "@clerk/nextjs"
import { useSafeAuth, useSafeUser, useSafeClerk, useSafeQuery } from "@/lib/hooks/use-safe-auth"
import Link from "next/link"
import Image from "next/image"
import { api } from "@/convex/_generated/api"
import { motion, AnimatePresence } from "framer-motion"
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background"
import { AnimatedMetalBorder } from "@/components/ui/animated-metal-border"
import {
  LogOut,
  User,
  Shield,
  CreditCard,
  Wallet,
  Eye,
  Check,
  X,
  Mail,
  Calendar,
  Loader2,
  ChevronRight,
  Clock,
} from "lucide-react"

export default function SecurityPage() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useSafeAuth()
  const { user } = useSafeUser()
  const { signOut } = useSafeClerk()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [activeSection, setActiveSection] = useState<"overview" | "profile">("overview")

  // Get user data from Convex
  const convexUser = useSafeQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkUserId: user.id } : "skip"
  )

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

  // Handle sign out
  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setIsSigningOut(false)
    }
  }

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

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return "N/A"
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const hasSubscription = devStatus?.stripeStatus === "active"

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
      <div className="flex justify-between items-center p-6 z-20">
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

        <div className="flex items-center gap-3">
          <Link
            href="/dev"
            className="px-3 py-1.5 rounded-lg font-mono text-xs bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors border border-zinc-700"
          >
            Dev Access
          </Link>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 transition-all duration-200 font-mono text-xs disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {isSigningOut ? "..." : "Sign Out"}
            </span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center px-4 pb-12 z-10">
        <div className="w-full max-w-4xl">
          {/* Page title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-accent" />
              <h1
                className="font-mono text-2xl md:text-3xl tracking-widest text-white uppercase"
                style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
              >
                Account Security
              </h1>
            </div>
            <p className="font-mono text-xs text-zinc-500">
              Manage your OPTX account and security settings
            </p>
          </div>

          {/* Section tabs */}
          <div className="flex justify-center mb-6">
            <div className="flex bg-zinc-900/80 rounded-lg p-1 border border-zinc-800">
              <button
                onClick={() => setActiveSection("overview")}
                className={`px-6 py-2 rounded-md font-mono text-xs tracking-wider transition-all duration-200 ${
                  activeSection === "overview"
                    ? "bg-accent text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                OVERVIEW
              </button>
              <button
                onClick={() => setActiveSection("profile")}
                className={`px-6 py-2 rounded-md font-mono text-xs tracking-wider transition-all duration-200 ${
                  activeSection === "profile"
                    ? "bg-accent text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                EDIT PROFILE
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeSection === "overview" ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* Account Info Card */}
                <AnimatedMetalBorder
                  containerClassName="rounded-xl"
                  borderWidth={2}
                  borderRadius={12}
                >
                  <div className="bg-zinc-900/90 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                        {user?.imageUrl ? (
                          <Image
                            src={user.imageUrl}
                            alt="Avatar"
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                        ) : (
                          <User className="w-6 h-6 text-accent" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-mono text-sm text-white truncate">
                          {user?.fullName || user?.firstName || "User"}
                        </h3>
                        <p className="font-mono text-xs text-zinc-500 truncate">
                          {user?.primaryEmailAddress?.emailAddress}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                        <span className="font-mono text-xs text-zinc-400 flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5" /> Email
                        </span>
                        <span className="font-mono text-xs text-white">
                          {user?.primaryEmailAddress?.emailAddress}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                        <span className="font-mono text-xs text-zinc-400 flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" /> Joined
                        </span>
                        <span className="font-mono text-xs text-white">
                          {convexUser?.createdAt ? formatDate(convexUser.createdAt) : formatDate(user?.createdAt ? new Date(user.createdAt).getTime() : undefined)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                        <span className="font-mono text-xs text-zinc-400 flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5" /> Dev Access
                        </span>
                        <span className={`font-mono text-xs px-2 py-0.5 rounded-full ${
                          hasSubscription
                            ? "bg-green-500/20 text-green-400"
                            : "bg-zinc-700 text-zinc-400"
                        }`}>
                          {hasSubscription ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="font-mono text-xs text-zinc-400 flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5" /> Clerk ID
                        </span>
                        <span className="font-mono text-[10px] text-zinc-500">
                          {user?.id?.slice(0, 16)}...
                        </span>
                      </div>
                    </div>
                  </div>
                </AnimatedMetalBorder>

                {/* Subscription Card */}
                <AnimatedMetalBorder
                  containerClassName="rounded-xl"
                  borderWidth={2}
                  borderRadius={12}
                >
                  <div className="bg-zinc-900/90 p-6 rounded-xl h-full">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="w-5 h-5 text-accent" />
                      <h3 className="font-mono text-sm text-white">Subscription</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                        <span className="font-mono text-xs text-zinc-400">Status</span>
                        <span
                          className={`font-mono text-xs px-2 py-0.5 rounded-full ${
                            hasSubscription
                              ? "bg-green-500/20 text-green-400"
                              : "bg-zinc-700 text-zinc-400"
                          }`}
                        >
                          {hasSubscription ? "Active" : "Free"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                        <span className="font-mono text-xs text-zinc-400">Plan</span>
                        <span className="font-mono text-xs text-white">
                          {hasSubscription ? "Subscriber" : "Free"}
                        </span>
                      </div>
                      {devStatus?.stripeCustomerId && (
                        <div className="flex items-center justify-between py-2">
                          <span className="font-mono text-xs text-zinc-400">Customer ID</span>
                          <span className="font-mono text-[10px] text-zinc-500">
                            {devStatus.stripeCustomerId.slice(0, 16)}...
                          </span>
                        </div>
                      )}
                    </div>

                    {!hasSubscription && (
                      <Link
                        href="/pricing"
                        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 text-white font-mono text-xs transition-colors"
                      >
                        Subscribe
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </AnimatedMetalBorder>

                {/* Wallet Card — Coming Soon */}
                <AnimatedMetalBorder
                  containerClassName="rounded-xl"
                  borderWidth={2}
                  borderRadius={12}
                >
                  <div className="bg-zinc-900/90 p-6 rounded-xl relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-yellow-400/60" />
                        <h3 className="font-mono text-sm text-zinc-400">Wallets</h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-yellow-500/10 text-yellow-400/80 border border-yellow-500/20">
                        COMING SOON
                      </span>
                    </div>

                    <div className="space-y-3 opacity-50">
                      <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                        <span className="font-mono text-xs text-zinc-400">Phantom</span>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-yellow-400/50" />
                          <span className="font-mono text-xs text-zinc-500">Coming soon</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                        <span className="font-mono text-xs text-zinc-400">OKX Wallet</span>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-yellow-400/50" />
                          <span className="font-mono text-xs text-zinc-500">Coming soon</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="font-mono text-xs text-zinc-400">$JTX Balance</span>
                        <span className="font-mono text-xs text-zinc-500">--</span>
                      </div>
                    </div>

                    <p className="mt-4 font-mono text-[10px] text-yellow-400/60">
                      Subscribe to help us build the JOE model on Devnet!
                    </p>
                  </div>
                </AnimatedMetalBorder>

                {/* Verification Card — Coming Soon */}
                <AnimatedMetalBorder
                  containerClassName="rounded-xl"
                  borderWidth={2}
                  borderRadius={12}
                >
                  <div className="bg-zinc-900/90 p-6 rounded-xl h-full relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Eye className="w-5 h-5 text-yellow-400/60" />
                        <h3 className="font-mono text-sm text-zinc-400">Gaze Verification</h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-yellow-500/10 text-yellow-400/80 border border-yellow-500/20">
                        COMING SOON
                      </span>
                    </div>

                    <div className="space-y-3 opacity-50">
                      <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                        <span className="font-mono text-xs text-zinc-400">Gaze Verified</span>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-yellow-400/50" />
                          <span className="font-mono text-xs text-zinc-500">Coming soon</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                        <span className="font-mono text-xs text-zinc-400">Attestation</span>
                        <span className="font-mono text-xs text-zinc-500">--</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="font-mono text-xs text-zinc-400">$OPTX Earned</span>
                        <span className="font-mono text-xs text-zinc-500">--</span>
                      </div>
                    </div>

                    <p className="mt-4 font-mono text-[10px] text-yellow-400/60">
                      Subscribe to help us build the JOE model on Devnet!
                    </p>
                  </div>
                </AnimatedMetalBorder>
              </motion.div>
            ) : (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex justify-center"
              >
                <AnimatedMetalBorder
                  containerClassName="rounded-2xl w-full max-w-[900px]"
                  borderWidth={4}
                  borderRadius={16}
                >
                  <div className="clerk-profile-wrapper rounded-2xl w-full">
                    <style jsx global>{`
                      .clerk-profile-wrapper .cl-rootBox,
                      .clerk-profile-wrapper .cl-card,
                      .clerk-profile-wrapper .cl-navbar,
                      .clerk-profile-wrapper .cl-navbarButton,
                      .clerk-profile-wrapper .cl-profileSection,
                      .clerk-profile-wrapper .cl-profileSectionTitle,
                      .clerk-profile-wrapper .cl-profileSectionContent,
                      .clerk-profile-wrapper .cl-formFieldLabel,
                      .clerk-profile-wrapper .cl-formFieldInput,
                      .clerk-profile-wrapper .cl-formButtonPrimary,
                      .clerk-profile-wrapper .cl-button {
                        font-family: var(--font-geist-mono), monospace !important;
                      }

                      .clerk-profile-wrapper .cl-rootBox {
                        width: 100% !important;
                        max-width: 900px !important;
                        min-height: 500px !important;
                      }

                      .clerk-profile-wrapper .cl-card {
                        background: rgba(45, 43, 85, 0.95) !important;
                        backdrop-filter: blur(20px) !important;
                        border: none !important;
                        box-shadow: none !important;
                        width: 100% !important;
                        max-width: 900px !important;
                      }

                      .clerk-profile-wrapper .cl-navbar {
                        background: rgba(24, 24, 27, 0.8) !important;
                        border-right: 1px solid rgb(39, 39, 42) !important;
                      }

                      .clerk-profile-wrapper .cl-profileSection {
                        border-color: rgb(39, 39, 42) !important;
                      }

                      .clerk-profile-wrapper .cl-formFieldInput {
                        background: rgba(24, 24, 27, 0.5) !important;
                        border-color: rgb(39, 39, 42) !important;
                        color: white !important;
                      }

                      .clerk-profile-wrapper .cl-formButtonPrimary {
                        background: #b55200 !important;
                      }

                      .clerk-profile-wrapper .cl-formButtonPrimary:hover {
                        background: #8a3f00 !important;
                      }

                      @media (max-width: 768px) {
                        .clerk-profile-wrapper .cl-rootBox {
                          min-height: auto !important;
                        }
                        .clerk-profile-wrapper .cl-card {
                          flex-direction: column !important;
                        }
                        .clerk-profile-wrapper .cl-navbar {
                          width: 100% !important;
                          border-right: none !important;
                          border-bottom: 1px solid rgb(39, 39, 42) !important;
                          flex-direction: row !important;
                          overflow-x: auto !important;
                        }
                      }
                    `}</style>

                    <UserProfile
                      appearance={{
                        variables: {
                          colorPrimary: "#b55200",
                          colorDanger: "#ff4444",
                          colorText: "#ffffff",
                          colorTextSecondary: "#a1a1aa",
                          colorBackground: "#2d2b55",
                          colorInputBackground: "#18181b",
                          colorInputText: "#ffffff",
                          borderRadius: "0.5rem",
                        },
                        elements: {
                          rootBox: "w-full",
                          card: "bg-[#2d2b55]/95 shadow-none border-0 backdrop-blur-xl",
                          navbar: "bg-zinc-900/80 border-zinc-800",
                          navbarButton: "text-white hover:bg-zinc-800",
                          profileSection: "border-zinc-800",
                          profileSectionTitle: "text-white",
                          formFieldLabel: "text-zinc-400",
                          formFieldInput: "bg-zinc-900/50 border-zinc-800 text-white",
                          formButtonPrimary: "bg-accent hover:bg-accent/90",
                        },
                      }}
                    />
                  </div>
                </AnimatedMetalBorder>
              </motion.div>
            )}
          </AnimatePresence>
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
