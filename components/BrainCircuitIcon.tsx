'use client';

import React from 'react';

interface BrainCircuitIconProps {
  className?: string;
  size?: number;
}

export function BrainCircuitIcon({ className = '', size = 32 }: BrainCircuitIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Brain outline */}
      <path
        d="M12 2C9.5 2 7.5 3.5 6.5 5.5C5.5 5 4.5 5 3.5 5.5C2.5 6 2 7 2 8.5C2 10 2.5 11 3.5 11.5C3 13 3 14.5 3.5 16C4 17.5 5 18.5 6.5 19C7 20.5 8.5 22 11 22C13.5 22 15 20.5 15.5 19C17 18.5 18 17.5 18.5 16C19 14.5 19 13 18.5 11.5C19.5 11 20 10 20 8.5C20 7 19.5 6 18.5 5.5C17.5 5 16.5 5 15.5 5.5C14.5 3.5 12.5 2 12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Circuit nodes */}
      <circle cx="12" cy="8" r="1.5" fill="currentColor" />
      <circle cx="9" cy="12" r="1.5" fill="currentColor" />
      <circle cx="15" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
      {/* Circuit connections */}
      <path
        d="M12 9.5V10.5M9 13.5L9.7 14.2M15 13.5L14.3 14.2M12 14.5V15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10.5 9L9 10.5M13.5 9L15 10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
