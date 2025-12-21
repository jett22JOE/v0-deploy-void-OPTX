"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

type EncryptedTextProps = {
  text: string;
  className?: string;
  revealDelayMs?: number;
  charset?: string;
  flipDelayMs?: number;
  encryptedClassName?: string;
  revealedClassName?: string;
};

const DEFAULT_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[];:,.<>/?";

function getRandomChar(charset: string): string {
  return charset[Math.floor(Math.random() * charset.length)];
}

export const EncryptedText: React.FC<EncryptedTextProps> = ({
  text,
  className,
  revealDelayMs = 50,
  charset = DEFAULT_CHARSET,
  flipDelayMs = 50,
  encryptedClassName,
  revealedClassName,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  const [isMounted, setIsMounted] = useState(false);
  const [revealCount, setRevealCount] = useState(0);
  const [tick, setTick] = useState(0); // Force re-render for scramble

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Reset when scrolling out
    if (!isInView) {
      setRevealCount(0);
      return;
    }

    // Start animation when in view
    const startTime = performance.now();
    let lastFlip = startTime;
    let rafId: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const revealed = Math.min(text.length, Math.floor(elapsed / revealDelayMs));

      setRevealCount(revealed);

      // Flip scramble characters
      if (now - lastFlip >= flipDelayMs) {
        setTick(t => t + 1);
        lastFlip = now;
      }

      if (revealed < text.length) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafId);
  }, [isMounted, isInView, text.length, revealDelayMs, flipDelayMs]);

  if (!text) return null;

  // Server: render plain text
  if (!isMounted) {
    return (
      <span ref={ref} className={cn(className, revealedClassName)}>
        {text}
      </span>
    );
  }

  return (
    <motion.span
      ref={ref}
      className={cn(className)}
      aria-label={text}
    >
      {text.split("").map((char, i) => {
        const revealed = i < revealCount;
        // Use tick to force new random chars
        const displayChar = revealed
          ? char
          : char === " "
            ? " "
            : getRandomChar(charset);

        return (
          <span
            key={i}
            className={cn(revealed ? revealedClassName : encryptedClassName)}
          >
            {displayChar}
          </span>
        );
      })}
    </motion.span>
  );
};
