"use client"

import { useEffect } from "react"

export function ResizeObserverFix() {
  useEffect(() => {
    const originalError = window.onerror

    window.onerror = (message, source, lineno, colno, error) => {
      if (typeof message === "string" && message.includes("ResizeObserver loop")) {
        return true // Suppress this specific warning
      }
      return originalError ? originalError(message, source, lineno, colno, error) : false
    }

    // Also handle unhandledrejection for async errors
    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes("ResizeObserver loop")) {
        event.stopImmediatePropagation()
        event.preventDefault()
      }
    }

    window.addEventListener("error", handleError)

    return () => {
      window.onerror = originalError
      window.removeEventListener("error", handleError)
    }
  }, [])

  return null
}
