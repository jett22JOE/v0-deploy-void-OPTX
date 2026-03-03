"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { QRCodeSVG } from "qrcode.react"
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background"
import { Smartphone, Eye, Shield, Zap, Download, ChevronRight } from "lucide-react"

// MOJO App download URL — QR encodes this
const MOJO_APP_URL = "https://jettoptics.ai/mojo"

export default function GazeVerifyPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-start overflow-y-auto">
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
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-6 max-w-md w-full px-4 pt-24 pb-12">
        {/* Title */}
        <div className="text-center">
          <h1
            className="font-mono text-2xl md:text-3xl tracking-widest text-white uppercase mb-2"
            style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
          >
            MOJO
          </h1>
          <p className="font-mono text-sm text-orange-400">
            Official Gaze Authentication App
          </p>
          <p className="font-mono text-[11px] text-zinc-500 mt-1">
            Scan to download · Available on iOS &amp; Android
          </p>
        </div>

        {/* QR Code Card */}
        <div className="relative rounded-2xl border border-orange-500/20 bg-black/80 backdrop-blur-md p-8 shadow-xl shadow-orange-500/5">
          {/* Glow ring behind QR */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/5 via-transparent to-orange-500/5 pointer-events-none" />

          <div className="relative flex flex-col items-center gap-5">
            {/* QR code with founder image center */}
            <div className="p-5 bg-white rounded-2xl shadow-inner shadow-zinc-200">
              {mounted ? (
                <QRCodeSVG
                  value={MOJO_APP_URL}
                  size={240}
                  level="H"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#18181b"
                  imageSettings={{
                    src: "/images/JOE_founder_icon.png",
                    x: undefined,
                    y: undefined,
                    height: 64,
                    width: 64,
                    excavate: true,
                  }}
                />
              ) : (
                <div className="w-[240px] h-[240px] bg-zinc-100 animate-pulse rounded-lg" />
              )}
            </div>

            {/* Scan instruction */}
            <div className="flex items-center gap-2 text-orange-400">
              <Smartphone className="w-4 h-4" />
              <span className="font-mono text-xs tracking-wider">
                SCAN WITH YOUR CAMERA
              </span>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {[
            {
              icon: Eye,
              title: "Gaze Auth",
              desc: "Sign in with your eyes using AGT tensor calibration",
            },
            {
              icon: Shield,
              title: "JETT Auth",
              desc: "Quantum-resistant biometric encryption",
            },
            {
              icon: Zap,
              title: "$OPTX Rewards",
              desc: "Earn tokens for gaze verification sessions",
            },
            {
              icon: Download,
              title: "Offline Ready",
              desc: "Edge compute via Jetson for local processing",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col gap-1.5 p-3 rounded-xl border border-orange-500/10 bg-zinc-900/60 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-orange-500 shrink-0" />
                <span className="font-mono text-[11px] text-white font-medium">
                  {title}
                </span>
              </div>
              <p className="font-mono text-[9px] text-zinc-500 leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="w-full rounded-xl border border-orange-500/10 bg-zinc-900/40 p-4">
          <p className="font-mono text-[10px] text-orange-400 tracking-wider mb-3 uppercase">
            How it works
          </p>
          <div className="flex flex-col gap-2">
            {[
              "Scan the QR code with your phone camera",
              "Download MOJO from the App Store or Google Play",
              "Complete 6-step AGT gaze calibration",
              "Your gaze pattern creates an on-chain proof via AARON",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="font-mono text-[10px] text-orange-500 mt-0.5 shrink-0">
                  {i + 1}.
                </span>
                <p className="font-mono text-[10px] text-zinc-400 leading-relaxed">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Already have the app? */}
        <Link
          href="/optx-login"
          className="flex items-center gap-1 font-mono text-xs text-zinc-500 hover:text-orange-400 transition-colors group"
        >
          Already have MOJO?
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          <span className="text-orange-400">Sign in</span>
        </Link>

        {/* Footer */}
        <div className="text-center mt-2">
          <p className="font-mono text-[9px] text-zinc-600">
            Powered by AARON Protocol · Private compute, public proof
          </p>
          <p className="font-mono text-[9px] text-zinc-700 mt-1">
            © 2026 Jett Optics · jettoptics.ai
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
