"use client"

import { ReactLenis, useLenis } from "lenis/react"
import { useEffect, type ReactNode } from "react"

function HashScrollHandler() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    // Wait for page to render, then scroll to hash anchor
    const hash = window.location.hash;
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        // Small delay to let Lenis initialize and content render
        setTimeout(() => {
          lenis.scrollTo(target as HTMLElement, { offset: -20, duration: 1.5 });
        }, 500);
      }
    }
  }, [lenis]);

  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }}>
      <HashScrollHandler />
      {children}
    </ReactLenis>
  )
}
