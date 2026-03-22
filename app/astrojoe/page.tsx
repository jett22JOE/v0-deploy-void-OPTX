"use client"

import dynamic from "next/dynamic"

const AstroJoeClient = dynamic(() => import("./client"), { ssr: false })

export default function AstroJoePage() {
  return <AstroJoeClient />
}
