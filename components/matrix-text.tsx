"use client"

import { EncryptedText } from "@/components/ui/encrypted-text"

interface MatrixTextProps {
  text: string
  className?: string
  delay?: number
  speed?: number
}

export function MatrixText({ text, className = "", delay = 0, speed = 50 }: MatrixTextProps) {
  return (
    <EncryptedText
      text={text}
      className={className}
      revealDelayMs={speed}
      flipDelayMs={30}
      encryptedClassName="text-accent/50"
      revealedClassName="text-current"
    />
  )
}
