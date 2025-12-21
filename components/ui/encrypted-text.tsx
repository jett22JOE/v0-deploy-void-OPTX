"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
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

function generateRandomCharacter(charset: string): string {
  return charset.charAt(Math.floor(Math.random() * charset.length));
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
  const [scrambleChars, setScrambleChars] = useState<string[]>([]);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Generate initial scramble
  const generateScramble = useCallback(() => {
    return text.split("").map((ch) =>
      ch === " " ? " " : generateRandomCharacter(charset)
    );
  }, [text, charset]);

  // Initialize on mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle animation
  useEffect(() => {
    if (!isMounted || !isInView) {
      // Reset when out of view
      if (!isInView && revealCount > 0) {
        setRevealCount(0);
        setScrambleChars(generateScramble());
      }
      return;
    }

    // Start fresh animation
    setRevealCount(0);
    setScrambleChars(generateScramble());
    startTimeRef.current = performance.now();

    let lastFlipTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const newRevealCount = Math.min(
        text.length,
        Math.floor(elapsed / revealDelayMs)
      );

      setRevealCount(newRevealCount);

      // Flip unrevealed characters
      if (now - lastFlipTime >= flipDelayMs) {
        setScrambleChars((prev) =>
          prev.map((ch, i) => {
            if (i >= newRevealCount && text[i] !== " ") {
              return generateRandomCharacter(charset);
            }
            return ch;
          })
        );
        lastFlipTime = now;
      }

      if (newRevealCount < text.length) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isMounted, isInView, text, revealDelayMs, flipDelayMs, charset, generateScramble]);

  if (!text) return null;

  // Server render: plain text
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
      role="text"
    >
      {text.split("").map((char, index) => {
        const isRevealed = index < revealCount;
        const displayChar = isRevealed
          ? char
          : char === " "
            ? " "
            : (scrambleChars[index] || generateRandomCharacter(charset));

        return (
          <span
            key={index}
            className={cn(isRevealed ? revealedClassName : encryptedClassName)}
          >
            {displayChar}
          </span>
        );
      })}
    </motion.span>
  );
};
