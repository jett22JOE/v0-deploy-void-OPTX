"use client";
import React, { useEffect, useRef, useState } from "react";
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
  const [isMounted, setIsMounted] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [revealCount, setRevealCount] = useState(0);
  const [scrambleKey, setScrambleKey] = useState(0);

  // Mount check
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Intersection Observer for visibility detection
  useEffect(() => {
    if (!isMounted || !ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
          } else {
            setIsInView(false);
            setRevealCount(0);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [isMounted]);

  // Animation logic
  useEffect(() => {
    if (!isMounted || !isInView) return;

    // Reset for fresh animation
    setRevealCount(0);
    const startTime = performance.now();
    let lastFlipTime = startTime;
    let animationId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const newRevealCount = Math.min(
        text.length,
        Math.floor(elapsed / revealDelayMs)
      );

      setRevealCount(newRevealCount);

      // Update scramble characters periodically
      if (currentTime - lastFlipTime >= flipDelayMs) {
        setScrambleKey((k) => k + 1);
        lastFlipTime = currentTime;
      }

      // Continue animation if not fully revealed
      if (newRevealCount < text.length) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isMounted, isInView, text, revealDelayMs, flipDelayMs]);

  if (!text) return null;

  // Server-side render: plain text to avoid hydration mismatch
  if (!isMounted) {
    return (
      <span ref={ref} className={cn(className, revealedClassName)}>
        {text}
      </span>
    );
  }

  return (
    <span ref={ref} className={cn(className)} aria-label={text}>
      {text.split("").map((char, index) => {
        const isRevealed = index < revealCount;

        // Each character is wrapped in a relative span that always
        // reserves the real character's width, preventing layout shift.
        // The scrambled glyph is absolutely positioned on top.
        if (char === " ") {
          return (
            <span
              key={`${index}-space`}
              className={cn(isRevealed ? revealedClassName : encryptedClassName)}
            >
              {" "}
            </span>
          );
        }

        return (
          <span
            key={index}
            className="relative inline-block"
            style={{ overflow: "hidden" }}
          >
            {/* Real character — always in flow, drives width */}
            <span
              className={cn(revealedClassName)}
              style={{ visibility: isRevealed ? "visible" : "hidden" }}
            >
              {char}
            </span>
            {/* Scrambled character overlay — shown until revealed */}
            {!isRevealed && (
              <span
                key={`${index}-${scrambleKey}`}
                className={cn(encryptedClassName, "absolute inset-0 flex items-center justify-center")}
                aria-hidden="true"
              >
                {getRandomChar(charset)}
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
};
