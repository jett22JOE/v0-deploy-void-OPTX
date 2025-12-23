"use client"

import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AnimatedMetalBorderProps {
  children: ReactNode
  className?: string
  containerClassName?: string
  borderWidth?: number
  borderRadius?: number
}

export function AnimatedMetalBorder({
  children,
  className,
  containerClassName,
  borderWidth = 3,
  borderRadius = 16,
}: AnimatedMetalBorderProps) {
  return (
    <div
      className={cn(
        "relative p-[var(--border-width)] overflow-hidden",
        containerClassName
      )}
      style={{
        "--border-width": `${borderWidth}px`,
        "--border-radius": `${borderRadius}px`,
        borderRadius: `${borderRadius}px`,
      } as React.CSSProperties}
    >
      {/* Animated metallic gradient border */}
      <div
        className="absolute inset-0 animate-metal-flow"
        style={{
          borderRadius: `${borderRadius}px`,
          background: `
            conic-gradient(
              from var(--metal-angle, 0deg) at 50% 50%,
              #1a1a1a 0deg,
              #4a4a4a 30deg,
              #8a8a8a 60deg,
              #d4d4d4 90deg,
              #f0f0f0 120deg,
              #d4d4d4 150deg,
              #8a8a8a 180deg,
              #4a4a4a 210deg,
              #1a1a1a 240deg,
              #4a4a4a 270deg,
              #8a8a8a 300deg,
              #c0c0c0 330deg,
              #1a1a1a 360deg
            )
          `,
        }}
      />

      {/* Secondary shimmer overlay */}
      <div
        className="absolute inset-0 animate-metal-shimmer opacity-60"
        style={{
          borderRadius: `${borderRadius}px`,
          background: `
            linear-gradient(
              var(--shimmer-angle, 45deg),
              transparent 0%,
              rgba(255,255,255,0.1) 25%,
              rgba(255,255,255,0.3) 50%,
              rgba(255,255,255,0.1) 75%,
              transparent 100%
            )
          `,
          backgroundSize: "200% 200%",
        }}
      />

      {/* Content container */}
      <div
        className={cn("relative z-10 bg-[#0a0a0a]", className)}
        style={{
          borderRadius: `${Math.max(0, borderRadius - borderWidth)}px`,
        }}
      >
        {children}
      </div>

      {/* CSS Animation Keyframes */}
      <style jsx>{`
        @property --metal-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        @property --shimmer-angle {
          syntax: '<angle>';
          initial-value: 45deg;
          inherits: false;
        }

        .animate-metal-flow {
          animation: metalFlow 4s linear infinite;
        }

        .animate-metal-shimmer {
          animation: metalShimmer 3s ease-in-out infinite;
        }

        @keyframes metalFlow {
          from {
            --metal-angle: 0deg;
          }
          to {
            --metal-angle: 360deg;
          }
        }

        @keyframes metalShimmer {
          0%, 100% {
            background-position: 200% 200%;
            opacity: 0.4;
          }
          50% {
            background-position: 0% 0%;
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  )
}
