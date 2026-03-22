"use client"

import dynamic from "next/dynamic"

const TrainingClient = dynamic(() => import("./client"), { ssr: false })

export default function TrainingPage() {
  return <TrainingClient />
}
