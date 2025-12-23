"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface LiquidMetalCircleProps {
  children: ReactNode
  className?: string
  containerClassName?: string
  size?: number
  borderWidth?: number
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

export function LiquidMetalCircle({
  children,
  className,
  containerClassName,
  size = 160,
  borderWidth = 4,
  // Shader defaults matching the CodePen reference
  repetition = 1.5,
  softness = 0.5,
  shiftRed = 0.3,
  shiftBlue = 0.3,
  distortion = 0,
  contour = 0,
  angle = 100,
  scale = 1.5,
  speed = 0.6,
}: LiquidMetalCircleProps) {
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

        // Create new shader mount - circle shape
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
            u_shape: 1, // Circle shape - perfect for circular elements
            u_offsetX: 0,
            u_offsetY: 0,
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

  const innerSize = size - borderWidth * 2

  return (
    <div
      className={cn("relative", containerClassName)}
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Liquid metal shader background (circular) */}
      <div
        ref={containerRef}
        className="absolute inset-0 rounded-full overflow-hidden"
      />

      {/* Content container (inner circle) */}
      <div
        className={cn(
          "absolute rounded-full flex items-center justify-center overflow-hidden",
          className
        )}
        style={{
          width: innerSize,
          height: innerSize,
          top: borderWidth,
          left: borderWidth,
          background: "linear-gradient(to bottom, #2a2a2a, #1a1a1a)",
        }}
      >
        {children}
      </div>
    </div>
  )
}
