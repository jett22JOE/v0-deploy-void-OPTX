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
      {/* Animated liquid metal gradient border - orange accent theme */}
      <div
        className="absolute inset-0"
        style={{
          borderRadius: `${borderRadius}px`,
          background: `
            conic-gradient(
              from var(--metal-angle, 0deg) at 50% 50%,
              #1a0a00 0deg,
              #3d1a00 20deg,
              #7a3300 40deg,
              #b55200 60deg,
              #ff8c00 80deg,
              #ffb347 100deg,
              #ffd699 120deg,
              #ffb347 140deg,
              #ff8c00 160deg,
              #b55200 180deg,
              #7a3300 200deg,
              #3d1a00 220deg,
              #1a0a00 240deg,
              #3d1a00 260deg,
              #7a3300 280deg,
              #b55200 300deg,
              #ff8c00 320deg,
              #b55200 340deg,
              #1a0a00 360deg
            )
          `,
          animation: "metalFlow 3s linear infinite",
        }}
      />

      {/* Glow effect layer */}
      <div
        className="absolute inset-0 blur-sm"
        style={{
          borderRadius: `${borderRadius}px`,
          background: `
            conic-gradient(
              from var(--metal-angle, 0deg) at 50% 50%,
              transparent 0deg,
              rgba(181, 82, 0, 0.4) 60deg,
              rgba(255, 140, 0, 0.6) 90deg,
              rgba(255, 179, 71, 0.8) 120deg,
              rgba(255, 140, 0, 0.6) 150deg,
              rgba(181, 82, 0, 0.4) 180deg,
              transparent 240deg,
              rgba(181, 82, 0, 0.4) 300deg,
              transparent 360deg
            )
          `,
          animation: "metalFlow 3s linear infinite",
        }}
      />

      {/* Secondary shimmer overlay for liquid effect */}
      <div
        className="absolute inset-0"
        style={{
          borderRadius: `${borderRadius}px`,
          background: `
            linear-gradient(
              var(--shimmer-angle, 45deg),
              transparent 0%,
              rgba(255,179,71,0.15) 25%,
              rgba(255,214,153,0.4) 50%,
              rgba(255,179,71,0.15) 75%,
              transparent 100%
            )
          `,
          backgroundSize: "200% 200%",
          animation: "metalShimmer 2s ease-in-out infinite",
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
            opacity: 0.5;
          }
          50% {
            background-position: 0% 0%;
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  )
}
