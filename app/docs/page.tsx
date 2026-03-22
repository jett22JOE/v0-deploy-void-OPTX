"use client"

import dynamic from "next/dynamic"

const DocsClient = dynamic(() => import("./client"), { ssr: false })

export default function DocsPage() {
  return <DocsClient />
}
