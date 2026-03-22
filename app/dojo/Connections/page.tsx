"use client"

import dynamic from "next/dynamic"

const ConnectionsClient = dynamic(() => import("./client"), { ssr: false })

export default function ConnectionsPage() {
  return <ConnectionsClient />
}
