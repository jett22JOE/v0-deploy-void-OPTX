"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface LiquidMetalBorderProps {
  children: ReactNode
  className?: string
  containerClassName?: string
  borderWidth?: number
  borderRadius?: number
  // Shader params
  repetition?: number
  softness?: number
  shiftRed?: number
  shiftBlue?: number
  distortion?: number
  contour?: number
  angle?: number
  scale?: number
  speed?: number
}

export function LiquidMetalBorder({
  children,
  className,
  containerClassName,
  borderWidth = 3,
  borderRadius = 16,
  // Shader defaults matching the CodePen
  repetition = 1.5,
  softness = 0.5,
  shiftRed = 0.3,
  shiftBlue = 0.3,
  distortion = 0,
  contour = 0,
  angle = 100,
  scale = 1.5,
  speed = 0.6,
}: LiquidMetalBorderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const shaderMountRef = useRef<unknown>(null)

  useEffect(() => {
    let mounted = true

    async function initShader() {
      if (!containerRef.current || !mounted) return

      try {
        // Dynamic import to avoid SSR issues
        const { ShaderMount, liquidMetalFragmentShader } = await import(
          "@paper-design/shaders"
        )

        if (!mounted || !containerRef.current) return

        // Clean up previous instance
        if (shaderMountRef.current) {
          (shaderMountRef.current as { destroy?: () => void }).destroy?.()
        }

        // Create new shader mount
        shaderMountRef.current = new ShaderMount(
          containerRef.current,
          liquidMetalFragmentShader,
          {
            u_repetition: repetition,
            u_softness: softness,
            u_shiftRed: shiftRed,
            u_shiftBlue: shiftBlue,
            u_distortion: distortion,
            u_contour: contour,
            u_angle: angle,
            u_scale: scale,
            u_shape: 1, // Circle shape - will be masked by CSS
            u_offsetX: 0.1,
            u_offsetY: -0.1,
          },
          undefined,
          speed
        )
      } catch (error) {
        console.error("Failed to initialize liquid metal shader:", error)
      }
    }

    initShader()

    return () => {
      mounted = false
      if (shaderMountRef.current) {
        (shaderMountRef.current as { destroy?: () => void }).destroy?.()
      }
    }
  }, [repetition, softness, shiftRed, shiftBlue, distortion, contour, angle, scale, speed])

  return (
    <div
      className={cn(
        "relative p-[var(--border-width)]",
        containerClassName
      )}
      style={{
        "--border-width": `${borderWidth}px`,
        "--border-radius": `${borderRadius}px`,
        borderRadius: `${borderRadius}px`,
      } as React.CSSProperties}
    >
      {/* Liquid metal shader background (the border) */}
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-hidden"
        style={{
          borderRadius: `${borderRadius}px`,
        }}
      />

      {/* Content container that masks the inner area */}
      <div
        className={cn("relative z-10 bg-[#1a1625]", className)}
        style={{
          borderRadius: `${borderRadius - borderWidth}px`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
