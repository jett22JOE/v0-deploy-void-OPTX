"use client"

import { useEffect } from "react"

export function ClerkCustomClose() {
  useEffect(() => {
    // Wait for Clerk modal to mount
    const observer = new MutationObserver(() => {
      // Find Clerk's modal close button
      const clerkCloseButton = document.querySelector('button[aria-label="Close"]') as HTMLButtonElement

      if (clerkCloseButton && !clerkCloseButton.dataset.customized) {
        // Mark as customized to avoid re-processing
        clerkCloseButton.dataset.customized = "true"

        // Clear existing content
        clerkCloseButton.innerHTML = ""

        // Remove all inline styles and classes that interfere
        clerkCloseButton.style.cssText = ""
        clerkCloseButton.className = ""

        // Apply our custom styles
        Object.assign(clerkCloseButton.style, {
          position: "absolute",
          top: "16px",
          right: "16px",
          width: "32px",
          height: "32px",
          padding: "4px",
          backgroundColor: "transparent",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
          zIndex: "10",
        })

        // Create img element for the custom X icon
        const xIcon = document.createElement("img")
        xIcon.src = "/icons/x-icon.svg"
        xIcon.alt = "Close"
        xIcon.style.cssText = `
          width: 24px;
          height: 24px;
          display: block;
          filter: brightness(0) saturate(100%) invert(32%) sepia(95%) saturate(1847%) hue-rotate(12deg) brightness(95%) contrast(101%);
          transition: all 0.2s ease;
        `

        // Add hover effect
        clerkCloseButton.addEventListener("mouseenter", () => {
          clerkCloseButton.style.backgroundColor = "rgba(181, 82, 0, 0.1)"
          clerkCloseButton.style.transform = "scale(1.1)"
          // Lighter orange on hover
          xIcon.style.filter =
            "brightness(0) saturate(100%) invert(46%) sepia(97%) saturate(1573%) hue-rotate(7deg) brightness(99%) contrast(97%)"
        })

        clerkCloseButton.addEventListener("mouseleave", () => {
          clerkCloseButton.style.backgroundColor = "transparent"
          clerkCloseButton.style.transform = "scale(1)"
          // Back to original orange
          xIcon.style.filter =
            "brightness(0) saturate(100%) invert(32%) sepia(95%) saturate(1847%) hue-rotate(12deg) brightness(95%) contrast(101%)"
        })

        // Append the icon
        clerkCloseButton.appendChild(xIcon)
      }
    })

    // Start observing the document for Clerk modal
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => observer.disconnect()
  }, [])

  return null
}
