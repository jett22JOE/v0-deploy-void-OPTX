"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { GazeTensor, TENSOR_CONFIG } from "@/lib/joule/types"

interface TensorSnapshot {
  cog: number
  env: number
  emo: number
}

interface AGTCircleProps {
  /** Current gaze tensor section */
  gazeSection?: GazeTensor | null
  /** Whether eye tracking is active */
  isTracking?: boolean
  /** Whether user is holding gaze */
  isHolding?: boolean
  /** Tensor values (0-1 for each) */
  tensorData?: TensorSnapshot
  /** Size variant */
  size?: "mini" | "small" | "medium" | "large"
  /** Called when user selects a section */
  onSectionSelect?: (section: GazeTensor, number: number) => void
  /** Additional className */
  className?: string
}

// Section divider angles (6 lines at 60° intervals for symmetric pattern)
const DIVIDER_ANGLES = [0, 60, 120, 180, 240, 300]

// Size configurations
const SIZE_CONFIG = {
  mini: { container: 140, circle: 120, section: 32, sectionRadius: 44, cursor: 16, cursorRadius: 38, centerText: "xl", labelSize: "5px" },
  small: { container: 180, circle: 160, section: 40, sectionRadius: 58, cursor: 20, cursorRadius: 50, centerText: "2xl", labelSize: "6px" },
  medium: { container: 220, circle: 200, section: 50, sectionRadius: 72, cursor: 24, cursorRadius: 60, centerText: "3xl", labelSize: "7px" },
  large: { container: 280, circle: 260, section: 64, sectionRadius: 90, cursor: 30, cursorRadius: 80, centerText: "5xl", labelSize: "8px" },
}

export function AGTCircle({
  gazeSection,
  isTracking = false,
  isHolding = false,
  tensorData,
  size = "medium",
  onSectionSelect,
  className,
}: AGTCircleProps) {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [cursorScale, setCursorScale] = useState(1)

  const config = SIZE_CONFIG[size]

  // Get accent color based on state
  const accentColor = isHolding || isTracking ? "#a855f7" : "#fb923c"
  const borderColor = isHolding || isTracking
    ? "rgba(168, 85, 247, 0.6)"
    : "rgba(255, 165, 100, 0.4)"

  // Animate cursor to section
  useEffect(() => {
    if (isTracking && gazeSection) {
      const sectionConfig = TENSOR_CONFIG[gazeSection]
      const radians = (sectionConfig.angle * Math.PI) / 180
      setCursorPos({
        x: Math.cos(radians) * config.cursorRadius,
        y: Math.sin(radians) * config.cursorRadius,
      })
      setCursorScale(1.2)
    } else if (!isTracking) {
      setCursorPos({ x: 0, y: 0 })
      setCursorScale(1)
    }
  }, [gazeSection, isTracking, config.cursorRadius])

  const handleSectionClick = (section: GazeTensor) => {
    const sectionConfig = TENSOR_CONFIG[section]
    onSectionSelect?.(section, sectionConfig.number)
  }

  const renderSection = (section: GazeTensor) => {
    const sectionConfig = TENSOR_CONFIG[section]
    const isActive = gazeSection === section && isTracking
    const radians = (sectionConfig.angle * Math.PI) / 180
    const x = Math.cos(radians) * config.sectionRadius
    const y = Math.sin(radians) * config.sectionRadius
    const halfSize = config.section / 2

    return (
      <div
        key={section}
        className={cn(
          "absolute rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer",
          isActive && "scale-110"
        )}
        style={{
          width: `${config.section}px`,
          height: `${config.section}px`,
          left: `calc(50% + ${x}px - ${halfSize}px)`,
          top: `calc(50% + ${y}px - ${halfSize}px)`,
          background: `linear-gradient(135deg, ${sectionConfig.colors[0]}, ${sectionConfig.colors[1]})`,
          border: isActive ? "2px solid white" : "1px solid rgba(255, 255, 255, 0.3)",
          opacity: isTracking ? 1 : 0.7,
          boxShadow: isActive ? `0 0 20px ${sectionConfig.colors[0]}80` : "none",
        }}
        onClick={() => handleSectionClick(section)}
      >
        <span className="text-lg font-bold text-white" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
          {sectionConfig.number}
        </span>
        <span className="font-semibold text-white/80 uppercase" style={{ fontSize: config.labelSize }}>
          {sectionConfig.label}
        </span>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {/* Main circular widget */}
      <div
        className="relative"
        style={{ width: `${config.container}px`, height: `${config.container}px` }}
      >
        {/* Background Circle */}
        <div
          className="absolute rounded-full transition-colors duration-300"
          style={{
            width: `${config.circle}px`,
            height: `${config.circle}px`,
            left: `${(config.container - config.circle) / 2}px`,
            top: `${(config.container - config.circle) / 2}px`,
            backgroundColor: "rgba(20, 10, 0, 0.5)",
            borderWidth: "2px",
            borderStyle: "solid",
            borderColor: borderColor,
          }}
        />

        {/* Section Dividers */}
        {DIVIDER_ANGLES.map((angle) => (
          <div
            key={angle}
            className="absolute transition-colors duration-300"
            style={{
              width: "1px",
              height: `${config.circle / 2}px`,
              backgroundColor: isHolding || isTracking
                ? "rgba(168, 85, 247, 0.4)"
                : "rgba(255, 165, 100, 0.3)",
              left: "50%",
              top: "50%",
              marginLeft: "-0.5px",
              marginTop: `-${config.circle / 4}px`,
              transform: `rotate(${angle}deg)`,
              transformOrigin: `center ${config.circle / 4}px`,
            }}
          />
        ))}

        {/* Gaze cursor */}
        <div
          className="absolute rounded-full transition-all duration-300 ease-out pointer-events-none"
          style={{
            width: `${config.cursor}px`,
            height: `${config.cursor}px`,
            left: `calc(50% + ${cursorPos.x}px - ${config.cursor / 2}px)`,
            top: `calc(50% + ${cursorPos.y}px - ${config.cursor / 2}px)`,
            transform: `scale(${cursorScale})`,
            backgroundColor: accentColor,
            boxShadow: `0 0 15px ${accentColor}`,
          }}
        >
          <div className="absolute rounded-full bg-white" style={{ inset: "3px" }} />
        </div>

        {/* Center display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {isTracking && gazeSection ? (
            <>
              <span
                className={`text-${config.centerText} font-bold`}
                style={{
                  color: TENSOR_CONFIG[gazeSection].colors[0],
                  textShadow: `0 0 15px ${TENSOR_CONFIG[gazeSection].colors[0]}`,
                }}
              >
                {TENSOR_CONFIG[gazeSection].number}
              </span>
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: TENSOR_CONFIG[gazeSection].colors[0] }}
              >
                {TENSOR_CONFIG[gazeSection].label}
              </span>
            </>
          ) : (
            <span className="text-gray-500 text-[10px] uppercase">Gaze</span>
          )}
        </div>

        {/* AGT Section nodes */}
        {(["COG", "EMO", "ENV"] as GazeTensor[]).map(renderSection)}
      </div>

      {/* Tensor values display */}
      {tensorData && (
        <div className="flex gap-6 mt-4">
          {(["COG", "EMO", "ENV"] as GazeTensor[]).map((section) => {
            const sectionConfig = TENSOR_CONFIG[section]
            const key = section.toLowerCase() as keyof TensorSnapshot
            const value = tensorData[key]
            return (
              <div key={section} className="flex flex-col items-center">
                <span
                  className="text-sm font-bold uppercase tracking-wide"
                  style={{ color: sectionConfig.colors[0], opacity: 0.8 }}
                >
                  {sectionConfig.label}
                </span>
                <span
                  className="font-mono font-bold text-lg"
                  style={{
                    color: sectionConfig.colors[0],
                    textShadow: `0 0 10px ${sectionConfig.colors[0]}60`,
                  }}
                >
                  {value.toFixed(3)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export type { AGTCircleProps, TensorSnapshot }
