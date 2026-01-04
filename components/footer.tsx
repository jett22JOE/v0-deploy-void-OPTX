"use client"
import Image from "next/image"
import Link from "next/link"
import { WaitlistButton } from "./waitlist-button"
import { InstagramIcon, XIcon, ZoraIcon, FarcasterIcon, CosmosIcon } from "./icons/social-icons"
import { useState, useEffect, useRef } from "react"

const socialLinks = [
  { name: "Instagram", href: "https://instagram.com/jettoptx", icon: InstagramIcon },
  { name: "X", href: "https://x.com/jettoptx?s=21&t=FxRpqXgpbbk57hTB5gaUnw", icon: XIcon },
  { name: "Zora", href: "https://zora.co/@jettoptx", icon: ZoraIcon },
  { name: "Farcaster", href: "https://farcaster.xyz/jettoptx", icon: FarcasterIcon },
  { name: "Cosmos", href: "https://www.cosmos.so/jettoptx", icon: CosmosIcon },
]

export function Footer() {
  const [time, setTime] = useState("")
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    const updateTime = () => {
      if (!mountedRef.current) return
      const now = new Date()
      const hours = String(now.getUTCHours()).padStart(2, "0")
      const minutes = String(now.getUTCMinutes()).padStart(2, "0")
      const seconds = String(now.getUTCSeconds()).padStart(2, "0")
      const milliseconds = String(now.getUTCMilliseconds()).padStart(3, "0")
      setTime(`${hours}:${minutes}:${seconds}:${milliseconds}`)
    }

    updateTime()
    const interval = setInterval(updateTime, 50)

    return () => {
      mountedRef.current = false
      clearInterval(interval)
    }
  }, [])

  return (
    <footer className="relative">
      <WaitlistButton />

      {/* Footer Info */}
      <div className="px-8 md:px-12 py-8 border-t border-white/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-2">
            <a
              href="mailto:founder@jettoptics.ai"
              className="font-mono text-xs tracking-widest hover:opacity-80 transition-opacity duration-300"
            >
              <span className="text-accent">Contact: </span>
              <span className="text-white">founder@jettoptics.ai</span>
            </a>
            <p className="font-mono text-xs tracking-widest text-muted-foreground">
              <span className="text-accent">UTC(GMT) - </span>
              <span className="text-white">{time} Z</span>
            </p>
          </div>

          <div className="flex gap-4">
            {socialLinks.map((social) => (
              <Link
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-hover
                className="text-muted-foreground hover:text-white transition-colors duration-300"
                aria-label={social.name}
              >
                <social.icon className="w-5 h-5" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/optical-spatial-encryption"
              className="w-10 h-10 bg-white rounded-lg border border-accent/30 flex items-center justify-center p-1.5 hover:border-accent hover:shadow-[0_0_15px_rgba(181,82,0,0.3)] transition-all duration-300"
            >
              <Image
                src="/images/jettoptics-logo.png"
                alt="JettOptics - Learn about Spatial Encryption"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </Link>
            <p className="font-mono text-xs tracking-widest text-muted-foreground">© {new Date().getFullYear()}</p>

            {/* TechForce OPTX Logo */}
            <Image
              src="/icons/techforce_OPTX.png"
              alt="TechForce OPTX"
              width={100}
              height={100}
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </footer>
  )
}
