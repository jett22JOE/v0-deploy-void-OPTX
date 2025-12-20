"use client"

import { useEffect, useState, useRef } from "react"

interface TypewriterTextProps {
  text: string
  className?: string
  delay?: number
  speed?: number
}

export function MatrixText({ text, className = "", delay = 0, speed = 40 }: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState("")
  const [hasStarted, setHasStarted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            setDisplayText("")
            setTimeout(() => setHasStarted(true), delay)
          } else {
            setIsVisible(false)
            setHasStarted(false)
            setDisplayText("")
          }
        })
      },
      { threshold: 0.3 },
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [delay])

  useEffect(() => {
    if (!hasStarted) return

    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [hasStarted, text, speed])

  return (
    <span ref={elementRef} className={className}>
      {displayText}
      {hasStarted && displayText.length < text.length && <span className="animate-pulse">|</span>}
    </span>
  )
}
