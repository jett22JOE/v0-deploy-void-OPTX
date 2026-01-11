"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { LiquidMetalCircle } from "@/components/ui/liquid-metal-circle"
import { AnimatedMetalBorder } from "@/components/ui/animated-metal-border"

export function SeoCTASection() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="mt-16">
      <AnimatedMetalBorder containerClassName="rounded-2xl" borderWidth={4} borderRadius={16}>
        <div className="p-8 bg-accent/5 relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex-1">
              <h3 className="font-sans text-xl md:text-2xl font-light mb-4 text-white">
                Ready to Experience Spatial Encryption?
              </h3>
              <p className="font-mono text-sm text-muted-foreground mb-6">
                Join the $JTX waitlist and be among the first to authenticate with your eyes.
              </p>
              <Link
                href="/loading"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-mono text-sm tracking-widest rounded-full hover:bg-accent/80 transition-colors"
              >
                JOIN WAITLIST
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Vision Logo Button */}
            <div className="flex flex-col items-center gap-2">
              <a
                href="https://jett.vision/vision"
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative block transition-transform duration-300 hover:scale-105"
              >
                <LiquidMetalCircle
                  size={120}
                  borderWidth={5}
                  repetition={1.5}
                  softness={0.5}
                  shiftRed={0.3}
                  shiftBlue={0.3}
                  distortion={0}
                  contour={0}
                  angle={100}
                  scale={1.5}
                  speed={0.6}
                >
                  <Image
                    src="/images/jettoptics-logo.png"
                    alt="Jett Optics Vision"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </LiquidMetalCircle>
              </a>

              {/* Hover text */}
              <div
                className={`font-mono text-xs tracking-widest text-center transition-all duration-300 ${
                  isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
              >
                <span className="text-accent">VISION</span>
                <span className="text-muted-foreground"> | Any Questions?</span>
              </div>
            </div>
          </div>
        </div>
      </AnimatedMetalBorder>
    </div>
  )
}
