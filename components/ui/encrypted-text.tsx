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

  // Split text into words so natural word-wrapping is preserved.
  // Each word is inline-block (won't break mid-word); spaces between
  // words allow the browser to line-break at word boundaries.
  const words = text.split(" ");

  // Pre-compute where each word starts in the global char index.
  const wordStarts: number[] = [];
  let offset = 0;
  for (const word of words) {
    wordStarts.push(offset);
    offset += word.length + 1; // +1 for space
  }

  return (
    <span ref={ref} className={cn(className)} aria-label={text}>
      {words.map((word, wordIndex) => {
        const wordStart = wordStarts[wordIndex];

        return (
          <React.Fragment key={wordIndex}>
            {/* Word wrapper — inline-block keeps word together, allows wrap between words */}
            <span className="inline-block">
              {word.split("").map((char, charIndex) => {
                const globalIndex = wordStart + charIndex;
                const isRevealed = globalIndex < revealCount;

                return (
                  <span
                    key={globalIndex}
                    className="relative inline-block"
                  >
                    {/* Real character — always in flow, drives width + height */}
                    <span
                      className={cn(revealedClassName)}
                      style={{ visibility: isRevealed ? "visible" : "hidden" }}
                    >
                      {char}
                    </span>
                    {/* Scrambled overlay — sits on top until revealed */}
                    {!isRevealed && (
                      <span
                        key={`${globalIndex}-${scrambleKey}`}
                        className={cn(
                          encryptedClassName,
                          "absolute inset-0 flex items-center justify-center"
                        )}
                        aria-hidden="true"
                      >
                        {getRandomChar(charset)}
                      </span>
                    )}
                  </span>
                );
              })}
            </span>
            {/* Space between words — regular inline, participates in line wrapping */}
            {wordIndex < words.length - 1 && (
              <span
                className={cn(
                  wordStart + word.length < revealCount
                    ? revealedClassName
                    : encryptedClassName
                )}
              >
                {" "}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </span>
  );
};
