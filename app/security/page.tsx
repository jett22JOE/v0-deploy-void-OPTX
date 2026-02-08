"use client"

// Force dynamic rendering to avoid SSR issues with Clerk/Convex
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { UserProfile } from "@clerk/nextjs"
import {
  useSafeAuth,
  useSafeUser,
  useSafeClerk,
  useSafeQuery,
} from "@/lib/hooks/use-safe-auth"
import Link from "next/link"
import Image from "next/image"
import { api } from "@/convex/_generated/api"
import {
  LogOut,
  User,
  Shield,
  CreditCard,
  Wallet,
  Eye,
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
  const [activeSection, setActiveSection] = useState<"overview" | "profile">(
    "overview"
  )

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
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
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
  const tier = convexUser?.subscriptionTier || "free"
  const tierLabel = tier === "free" ? "Free" : tier.toUpperCase()
  const tierColor =
    tier === "unlimited"
      ? "text-green-400"
      : tier === "dojo"
        ? "text-orange-400"
        : tier === "mojo"
          ? "text-blue-400"
          : "text-zinc-400"

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
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 transition-all font-mono text-xs disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {isSigningOut ? "..." : "Sign Out"}
            </span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center px-4 pb-12">
        <div className="w-full max-w-4xl">
          {/* Page title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-orange-500" />
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
                className={`px-6 py-2 rounded-md font-mono text-xs tracking-wider transition-all ${
                  activeSection === "overview"
                    ? "bg-orange-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                OVERVIEW
              </button>
              <button
                onClick={() => setActiveSection("profile")}
                className={`px-6 py-2 rounded-md font-mono text-xs tracking-wider transition-all ${
                  activeSection === "profile"
                    ? "bg-orange-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                EDIT PROFILE
              </button>
            </div>
          </div>

          {activeSection === "overview" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Account Info Card */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center overflow-hidden">
                    {user?.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt="Avatar"
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="w-6 h-6 text-orange-500" />
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
                      {convexUser?.createdAt
                        ? formatDate(convexUser.createdAt)
                        : formatDate(
                            user?.createdAt
                              ? new Date(user.createdAt).getTime()
                              : undefined
                          )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                    <span className="font-mono text-xs text-zinc-400 flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5" /> Dev Access
                    </span>
                    <span
                      className={`font-mono text-xs px-2 py-0.5 rounded-full ${
                        hasSubscription
                          ? "bg-green-500/20 text-green-400"
                          : "bg-zinc-700 text-zinc-400"
                      }`}
                    >
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

              {/* Subscription Card */}
              <div
                className={`rounded-xl border bg-zinc-900/80 p-6 h-full transition-colors ${
                  hasSubscription
                    ? "border-orange-500/30 hover:border-orange-500/50"
                    : "border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-orange-500" />
                  <h3 className="font-mono text-sm text-white">Subscription</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                    <span className="font-mono text-xs text-zinc-400">
                      Status
                    </span>
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
                    <span className="font-mono text-xs text-zinc-400">
                      Plan
                    </span>
                    <span
                      className={`font-mono text-xs font-semibold uppercase ${tierColor}`}
                    >
                      {tierLabel}
                    </span>
                  </div>
                  {devStatus?.stripeCustomerId && (
                    <div className="flex items-center justify-between py-2">
                      <span className="font-mono text-xs text-zinc-400">
                        Customer ID
                      </span>
                      <span className="font-mono text-[10px] text-zinc-500">
                        {devStatus.stripeCustomerId.slice(0, 16)}...
                      </span>
                    </div>
                  )}
                </div>

                {!hasSubscription && (
                  <Link
                    href="/pricing"
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs transition-colors"
                  >
                    Subscribe
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {/* Wallet Card */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 hover:border-zinc-700 transition-colors">
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
                    <span className="font-mono text-xs text-zinc-400">
                      Phantom
                    </span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-yellow-400/50" />
                      <span className="font-mono text-xs text-zinc-500">
                        Coming soon
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                    <span className="font-mono text-xs text-zinc-400">
                      OKX Wallet
                    </span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-yellow-400/50" />
                      <span className="font-mono text-xs text-zinc-500">
                        Coming soon
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="font-mono text-xs text-zinc-400">
                      $JTX Balance
                    </span>
                    <span className="font-mono text-xs text-zinc-500">--</span>
                  </div>
                </div>

                <p className="mt-4 font-mono text-[10px] text-yellow-400/60">
                  Subscribe to help us build the JOE model on Devnet!
                </p>
              </div>

              {/* Gaze Verification Card */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 h-full hover:border-zinc-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-yellow-400/60" />
                    <h3 className="font-mono text-sm text-zinc-400">
                      Gaze Verification
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-yellow-500/10 text-yellow-400/80 border border-yellow-500/20">
                    COMING SOON
                  </span>
                </div>

                <div className="space-y-3 opacity-50">
                  <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                    <span className="font-mono text-xs text-zinc-400">
                      Gaze Verified
                    </span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-yellow-400/50" />
                      <span className="font-mono text-xs text-zinc-500">
                        Coming soon
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                    <span className="font-mono text-xs text-zinc-400">
                      Attestation
                    </span>
                    <span className="font-mono text-xs text-zinc-500">--</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="font-mono text-xs text-zinc-400">
                      $OPTX Earned
                    </span>
                    <span className="font-mono text-xs text-zinc-500">--</span>
                  </div>
                </div>

                <p className="mt-4 font-mono text-[10px] text-yellow-400/60">
                  Subscribe to help us build the JOE model on Devnet!
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="rounded-2xl border border-zinc-800 w-full max-w-[900px] overflow-hidden">
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

                <div className="clerk-profile-wrapper">
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
                        formFieldInput:
                          "bg-zinc-900/50 border-zinc-800 text-white",
                        formButtonPrimary: "bg-accent hover:bg-accent/90",
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
