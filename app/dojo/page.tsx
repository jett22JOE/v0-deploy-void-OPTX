"use client"

import dynamic from "next/dynamic"

const DojoClient = dynamic(() => import("./client"), { ssr: false })

export default function DojoPage() {
  return <DojoClient />
}
