// Custom social media icons for Instagram, X, Zora, Farcaster, and Cosmos.so

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

export function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export function ZoraIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
      <defs>
        {/* Radial gradient for 3D orb effect - pink highlight to blue to purple/brown */}
        <radialGradient id="zoraGradient" cx="70%" cy="30%" r="70%" fx="70%" fy="30%">
          <stop offset="0%" stopColor="#ffeef8" />
          <stop offset="20%" stopColor="#c4a6ff" />
          <stop offset="45%" stopColor="#7b8cff" />
          <stop offset="70%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4a3728" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#zoraGradient)" />
    </svg>
  )
}

export function FarcasterIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M3 4h18v2.5l-1.5 1V19a1.5 1.5 0 0 1-1.5 1.5h-2A1.5 1.5 0 0 1 14.5 19v-4.5a2.5 2.5 0 0 0-5 0V19A1.5 1.5 0 0 1 8 20.5H6A1.5 1.5 0 0 1 4.5 19V7.5L3 6.5V4z" />
    </svg>
  )
}

export function CosmosIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      {/* 8 dots arranged in a circle - top */}
      <circle cx="12" cy="4" r="2" />
      {/* top-right */}
      <circle cx="17.66" cy="6.34" r="2" />
      {/* right */}
      <circle cx="20" cy="12" r="2" />
      {/* bottom-right */}
      <circle cx="17.66" cy="17.66" r="2" />
      {/* bottom */}
      <circle cx="12" cy="20" r="2" />
      {/* bottom-left */}
      <circle cx="6.34" cy="17.66" r="2" />
      {/* left */}
      <circle cx="4" cy="12" r="2" />
      {/* top-left */}
      <circle cx="6.34" cy="6.34" r="2" />
    </svg>
  )
}
