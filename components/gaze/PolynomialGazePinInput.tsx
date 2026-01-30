"use client"

import React, { useState, useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import {
  GazeTensor,
  PolynomialPosition,
  JOULETemplate,
  TENSOR_CONFIG,
  encodePolynomial,
  generateVerificationHash,
} from "@/lib/joule/types"

interface PolynomialGazePinInputProps {
  /** Number of positions in the polynomial (default 5) */
  positions?: number
  /** Hold time threshold in ms to confirm a position (default 800ms) */
  holdThreshold?: number
  /** Session nonce from server for JOULE template */
  sessionNonce: string
  /** Called when all positions are confirmed */
  onComplete: (template: JOULETemplate) => void
  /** Called when a position changes */
  onPositionChange?: (index: number, tensor: GazeTensor | null) => void
  /** Called on error */
  onError?: (error: string) => void
  /** Whether verification is in progress */
  isVerifying?: boolean
  /** Current gaze position from eye tracker (normalized -1 to 1) */
  gazePosition?: { x: number; y: number } | null
  /** Additional className */
  className?: string
}

// Classify gaze position to tensor
function classifyGaze(x: number, y: number): GazeTensor {
  // Simple 2D simplex classification (matches JOE agent)
  if (y > 0.3) return "COG"           // Looking UP
  if (x < -0.3 && y < -0.3) return "EMO" // DOWN-LEFT
  if (x > 0.3 && y < -0.3) return "ENV"  // DOWN-RIGHT
  // Default to COG for center gaze
  return "COG"
}

export function PolynomialGazePinInput({
  positions = 5,
  holdThreshold = 800,
  sessionNonce,
  onComplete,
  onPositionChange,
  onError,
  isVerifying = false,
  gazePosition,
  className,
}: PolynomialGazePinInputProps) {
  // State for each position
  const [pinPositions, setPinPositions] = useState<PolynomialPosition[]>(
    Array(positions).fill(null).map(() => ({
      tensor: null,
      holdStart: null,
      holdDuration: 0,
      confirmed: false,
      confidence: 0,
    }))
  )

  // Current position being filled
  const [currentIndex, setCurrentIndex] = useState(0)

  // Hold progress for current position
  const [holdProgress, setHoldProgress] = useState(0)

  // Current detected tensor
  const [currentTensor, setCurrentTensor] = useState<GazeTensor | null>(null)

  // Sequence start timestamp
  const sequenceStartRef = useRef<number>(0)

  // Hold timer ref
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null)
  const holdStartRef = useRef<number | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Process gaze position changes
  useEffect(() => {
    if (!gazePosition || currentIndex >= positions || isVerifying) return

    const detectedTensor = classifyGaze(gazePosition.x, gazePosition.y)

    // If tensor changed, reset hold timer
    if (detectedTensor !== currentTensor) {
      setCurrentTensor(detectedTensor)
      setHoldProgress(0)

      // Clear existing timers
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)

      // Start new hold timer
      holdStartRef.current = Date.now()

      // Start sequence timer on first position
      if (currentIndex === 0 && sequenceStartRef.current === 0) {
        sequenceStartRef.current = Date.now()
      }

      // Progress animation
      progressIntervalRef.current = setInterval(() => {
        if (holdStartRef.current) {
          const elapsed = Date.now() - holdStartRef.current
          const progress = Math.min((elapsed / holdThreshold) * 100, 100)
          setHoldProgress(progress)
        }
      }, 16) // ~60fps

      // Confirm position after threshold
      holdTimerRef.current = setTimeout(() => {
        confirmPosition(detectedTensor)
      }, holdThreshold)
    }

    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }, [gazePosition, currentTensor, currentIndex, positions, holdThreshold, isVerifying])

  // Confirm a position
  const confirmPosition = useCallback((tensor: GazeTensor) => {
    if (currentIndex >= positions) return

    const holdDuration = holdStartRef.current ? Date.now() - holdStartRef.current : holdThreshold

    setPinPositions(prev => {
      const newPositions = [...prev]
      newPositions[currentIndex] = {
        tensor,
        holdStart: holdStartRef.current,
        holdDuration,
        confirmed: true,
        confidence: 0.85, // Would come from actual classifier
      }
      return newPositions
    })

    onPositionChange?.(currentIndex, tensor)
    setHoldProgress(0)
    setCurrentTensor(null)
    holdStartRef.current = null

    // Move to next position or complete
    if (currentIndex + 1 >= positions) {
      // All positions filled - generate JOULE template
      setTimeout(() => completeSequence(), 100)
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }, [currentIndex, positions, holdThreshold, onPositionChange])

  // Complete the sequence and generate JOULE template
  const completeSequence = useCallback(async () => {
    const sequence = pinPositions.map(p => p.tensor).filter((t): t is GazeTensor => t !== null)
    const holdDurations = pinPositions.map(p => p.holdDuration)

    if (sequence.length !== positions) {
      onError?.("Incomplete sequence")
      return
    }

    try {
      const timestamp = sequenceStartRef.current
      const verificationHash = await generateVerificationHash(
        sessionNonce,
        sequence,
        holdDurations,
        timestamp
      )

      const template: JOULETemplate = {
        timestamp,
        sessionNonce,
        expirationWindow: 30000, // 30 seconds
        gazeSequence: sequence,
        holdDurations,
        transitionVectors: [], // Would be computed from actual gaze path
        polynomialEncoding: encodePolynomial(sequence),
        knotPolynomial: `AGT-${encodePolynomial(sequence)}-${Date.now()}`, // Simplified
        verificationHash,
      }

      onComplete(template)
    } catch (error) {
      onError?.("Failed to generate verification template")
    }
  }, [pinPositions, positions, sessionNonce, onComplete, onError])

  // Reset the input
  const reset = useCallback(() => {
    setPinPositions(Array(positions).fill(null).map(() => ({
      tensor: null,
      holdStart: null,
      holdDuration: 0,
      confirmed: false,
      confidence: 0,
    })))
    setCurrentIndex(0)
    setHoldProgress(0)
    setCurrentTensor(null)
    sequenceStartRef.current = 0
  }, [positions])

  // Manual position selection (for testing/accessibility)
  const selectPosition = useCallback((tensor: GazeTensor) => {
    if (currentIndex >= positions || isVerifying) return
    confirmPosition(tensor)
  }, [currentIndex, positions, isVerifying, confirmPosition])

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      {/* Position indicators */}
      <div className="flex gap-3">
        {pinPositions.map((pos, index) => {
          const isActive = index === currentIndex && !isVerifying
          const isFilled = pos.confirmed && pos.tensor
          const config = pos.tensor ? TENSOR_CONFIG[pos.tensor] : null

          return (
            <div
              key={index}
              className={cn(
                "relative w-14 h-14 rounded-xl border-2 transition-all duration-300",
                "flex items-center justify-center",
                isActive && "border-accent ring-2 ring-accent/30 scale-110",
                isFilled && "border-transparent",
                !isFilled && !isActive && "border-zinc-700 bg-zinc-900/50"
              )}
              style={{
                background: isFilled && config
                  ? `linear-gradient(135deg, ${config.colors[0]}, ${config.colors[1]})`
                  : undefined,
              }}
            >
              {/* Hold progress ring for active position */}
              {isActive && holdProgress > 0 && (
                <svg
                  className="absolute inset-0 w-full h-full -rotate-90"
                  viewBox="0 0 56 56"
                >
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-accent/30"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${(holdProgress / 100) * 150.8} 150.8`}
                    className="text-accent transition-all duration-100"
                  />
                </svg>
              )}

              {/* Position content */}
              {isFilled && config ? (
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-white drop-shadow-lg">
                    {config.number}
                  </span>
                  <span className="text-[8px] font-bold text-white/80 uppercase">
                    {config.label}
                  </span>
                </div>
              ) : isActive && currentTensor ? (
                <div className="flex flex-col items-center opacity-60">
                  <span className="text-lg font-bold" style={{ color: TENSOR_CONFIG[currentTensor].colors[0] }}>
                    {TENSOR_CONFIG[currentTensor].number}
                  </span>
                </div>
              ) : (
                <span className="text-zinc-600 text-xs">{index + 1}</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Current tensor indicator */}
      {currentTensor && !isVerifying && currentIndex < positions && (
        <div
          className="px-4 py-2 rounded-lg font-mono text-sm"
          style={{
            backgroundColor: `${TENSOR_CONFIG[currentTensor].colors[0]}20`,
            color: TENSOR_CONFIG[currentTensor].colors[0],
          }}
        >
          Hold: {TENSOR_CONFIG[currentTensor].label} ({Math.round(holdProgress)}%)
        </div>
      )}

      {/* Manual selection buttons (for testing/fallback) */}
      <div className="flex gap-4 mt-4">
        {(Object.keys(TENSOR_CONFIG) as GazeTensor[]).map((tensor) => {
          const config = TENSOR_CONFIG[tensor]
          const isDisabled = currentIndex >= positions || isVerifying

          return (
            <button
              key={tensor}
              onClick={() => selectPosition(tensor)}
              disabled={isDisabled}
              className={cn(
                "w-16 h-16 rounded-full transition-all duration-200",
                "flex flex-col items-center justify-center gap-1",
                "border-2 hover:scale-105 active:scale-95",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
              style={{
                background: `linear-gradient(135deg, ${config.colors[0]}, ${config.colors[1]})`,
                borderColor: `${config.colors[0]}80`,
              }}
            >
              <span className="text-lg font-bold text-white drop-shadow">{config.number}</span>
              <span className="text-[9px] font-bold text-white/80 uppercase">{config.label}</span>
            </button>
          )
        })}
      </div>

      {/* Status text */}
      <div className="text-center">
        {isVerifying ? (
          <p className="font-mono text-sm text-accent animate-pulse">Verifying gaze pattern...</p>
        ) : currentIndex >= positions ? (
          <p className="font-mono text-sm text-green-400">Pattern complete!</p>
        ) : (
          <p className="font-mono text-xs text-zinc-500">
            Position {currentIndex + 1} of {positions} — Look at a tensor and hold for {holdThreshold}ms
          </p>
        )}
      </div>

      {/* Reset button */}
      {currentIndex > 0 && !isVerifying && (
        <button
          onClick={reset}
          className="font-mono text-xs text-zinc-500 hover:text-zinc-300 underline"
        >
          Reset pattern
        </button>
      )}
    </div>
  )
}

export { type PolynomialGazePinInputProps }
