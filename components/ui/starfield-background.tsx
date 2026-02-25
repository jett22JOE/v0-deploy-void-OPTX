"use client"

import { DottedGlowBackground } from "@/components/ui/dotted-glow-background"

// ─── Star Positions (deterministic to avoid SSR hydration mismatch) ───────────
const STAR_POSITIONS = Array.from({ length: 40 }, (_, i) => ({
  x: ((i * 37 + 13) % 100),
  y: ((i * 53 + 7) % 100),
  delay: ((i * 17) % 30) / 10,
  duration: 2 + ((i * 23) % 30) / 10,
}))

// ─── Shooting Stars (deterministic) ─────────────────────────────────────────
const SHOOTING_STARS = Array.from({ length: 8 }, (_, i) => ({
  startX: ((i * 29 + 5) % 80) + 10,
  startY: ((i * 41 + 3) % 40),
  angle: 25 + ((i * 13) % 20),
  delay: ((i * 31) % 50) / 10,
  duration: 2.5 + ((i * 19) % 20) / 10,
  length: 40 + ((i * 23) % 40),
}))

/**
 * StarfieldBackground — unified background for all dark-themed pages.
 * Matches the vault page exactly:
 *   - Dark mode: orange pulsing stars + shooting stars (CSS animations)
 *   - Light mode: DottedGlowBackground with orange theme
 *
 * @param darkMode - controls which layer is shown
 * @param alwaysDark - force dark starfield (no light mode DottedGlowBackground)
 */
export function StarfieldBackground({
  darkMode = true,
  alwaysDark = false,
}: {
  darkMode?: boolean
  alwaysDark?: boolean
}) {
  const showStars = alwaysDark || darkMode
  const showDots = !alwaysDark && !darkMode

  return (
    <>
      {/* ─── Dark Mode: Pulsing stars + Shooting stars ─── */}
      {showStars && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {/* Pulsing ambient stars */}
          {STAR_POSITIONS.map((star, i) => (
            <div
              key={`star-${i}`}
              className="absolute w-0.5 h-0.5 bg-orange-400/30 rounded-full animate-pulse"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
              }}
            />
          ))}
          {/* Shooting stars */}
          {SHOOTING_STARS.map((s, i) => (
            <div
              key={`shoot-${i}`}
              className="absolute"
              style={{
                left: `${s.startX}%`,
                top: `${s.startY}%`,
                width: `${s.length}px`,
                height: '1px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(251,146,60,0.6) 40%, rgba(255,255,255,0.8) 100%)',
                transform: `rotate(${s.angle}deg)`,
                opacity: 0,
                animation: `shootingStar ${s.duration}s ease-in-out ${s.delay}s infinite`,
              }}
            />
          ))}
          <style>{`
            @keyframes shootingStar {
              0% { opacity: 0; transform: translateX(0) translateY(0) rotate(var(--angle, 30deg)); }
              5% { opacity: 0.8; }
              15% { opacity: 0.8; }
              30% { opacity: 0; transform: translateX(200px) translateY(120px) rotate(var(--angle, 30deg)); }
              100% { opacity: 0; }
            }
          `}</style>
        </div>
      )}

      {/* ─── Light Mode: Orange dotted glow background ─── */}
      {showDots && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <DottedGlowBackground
            opacity={0.4}
            gap={14}
            radius={1.5}
            color="rgba(181, 82, 0, 0.2)"
            glowColor="rgba(181, 82, 0, 0.5)"
            speedMin={0.2}
            speedMax={0.6}
            speedScale={0.7}
          />
        </div>
      )}
    </>
  )
}
