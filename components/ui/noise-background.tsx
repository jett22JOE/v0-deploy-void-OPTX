"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface NoiseBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  gradientColors?: string[];
  noiseIntensity?: number;
}

export const NoiseBackground = ({
  children,
  className,
  containerClassName,
  gradientColors = [
    "rgb(181, 82, 0)",
    "rgb(255, 140, 0)",
    "rgb(181, 82, 0)",
  ],
  noiseIntensity = 0.15,
}: NoiseBackgroundProps) => {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl p-[2px]",
        containerClassName,
      )}
      style={
        {
          "--noise-opacity": noiseIntensity,
        } as React.CSSProperties
      }
    >
      {/* Static gradient border */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]}, ${gradientColors[0]})`,
        }}
      />

      {/* Pulsing glow effect - smooth animation */}
      <motion.div
        className="absolute inset-0 blur-md"
        style={{
          background: `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]}, ${gradientColors[0]})`,
        }}
        animate={{
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Static Noise Pattern */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div
          className="h-full w-full opacity-[var(--noise-opacity)]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            mixBlendMode: "overlay",
          }}
        />
      </div>

      {/* Content */}
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};
