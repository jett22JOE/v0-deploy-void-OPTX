import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Stake JTX — Unlock OPTX Minting & Jett Augments",
  description: "Stake to power your personal Augment Net Graph and evolve with JETT Auth.",
}

export default function StakeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
