"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Eye, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { AGTRadarLegend } from "@/components/AGTRadarLegend"
import { AGTLineCharts } from "@/components/AGTLineCharts"
import { JETTUX } from "@/components/JETTUX"

const TENSOR_COLORS: Record<string, string> = {
  COG: "oklch(0.82 0.18 95)",
  ENV: "oklch(0.60 0.20 250)",
  EMO: "oklch(0.65 0.25 25)",
}

// Demo data for analytics (later: pull from SpacetimeDB subscriptions)
const DEMO_WEIGHTS = { COG: 142, EMO: 98, ENV: 115 }

const DEMO_SESSIONS = [
  {
    id: "sess_001",
    date: "2026-02-17 14:32",
    duration: "4m 12s",
    frames: 1580,
    cog: 45,
    emo: 28,
    env: 27,
    optxReward: 2.45,
    cstbVerified: true,
  },
  {
    id: "sess_002",
    date: "2026-02-16 09:15",
    duration: "2m 47s",
    frames: 920,
    cog: 33,
    emo: 38,
    env: 29,
    optxReward: 1.82,
    cstbVerified: true,
  },
  {
    id: "sess_003",
    date: "2026-02-15 22:08",
    duration: "6m 03s",
    frames: 2340,
    cog: 30,
    emo: 25,
    env: 45,
    optxReward: 3.10,
    cstbVerified: false,
  },
]

// Generate demo trend data
function generateDemoHistory() {
  const points = 30
  return Array.from({ length: points }, (_, i) => ({
    time: i,
    value: Math.floor(Math.random() * 8) + 1,
  }))
}

export default function AnalyticsPage() {
  const [selectedSlice, setSelectedSlice] = useState<string | null>(null)

  const cogHistory = generateDemoHistory()
  const emoHistory = generateDemoHistory()
  const envHistory = generateDemoHistory()

  const totalFrames = DEMO_SESSIONS.reduce((a, s) => a + s.frames, 0)
  const totalOptx = DEMO_SESSIONS.reduce((a, s) => a + s.optxReward, 0)
  const totalSessions = DEMO_SESSIONS.length
  const attestations = DEMO_SESSIONS.filter((s) => s.cstbVerified).length

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-orange-500/20">
        <div className="flex items-center gap-3">
          <Link href="/dojo" className="text-orange-400 hover:text-orange-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-mono text-lg text-orange-400 tracking-widest">AGT ANALYTICS</h1>
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
            AUGMENTS
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-400 border-green-500/30 text-xs bg-black/20 flex items-center gap-1">
            <Eye className="w-3 h-3" />
            Gaze-Lock Ready
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-[1400px] mx-auto space-y-4">

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total Sessions", value: totalSessions, sub: "training runs" },
              { label: "Frames Processed", value: totalFrames.toLocaleString(), sub: "gaze frames" },
              { label: "$OPTX Earned", value: totalOptx.toFixed(2), sub: "devnet rewards" },
              { label: "CSTB Attestations", value: `${attestations}/${totalSessions}`, sub: "verified" },
            ].map((stat) => (
              <Card key={stat.label} className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-yellow-500/5 backdrop-blur">
                <CardContent className="p-3">
                  <p className="text-[10px] text-orange-400/60 font-mono uppercase">{stat.label}</p>
                  <p className="text-2xl font-bold text-orange-300 mt-1">{stat.value}</p>
                  <p className="text-[10px] text-orange-400/40 font-mono">{stat.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Radar Chart - Augment Distribution */}
            <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-yellow-500/5 backdrop-blur shadow-lg shadow-orange-500/5">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-sm text-orange-300 font-semibold flex items-center gap-2">
                  Augment Distribution
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px]">
                    Radar
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <AGTRadarLegend agtWeights={DEMO_WEIGHTS} />
              </CardContent>
            </Card>

            {/* Interactive Pie Chart - Session Tensor Split */}
            <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-yellow-500/5 backdrop-blur shadow-lg shadow-orange-500/5">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-sm text-orange-300 font-semibold flex items-center gap-2">
                  Session Tensor Split
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]">
                    Interactive
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <JETTUX
                  agtWeights={DEMO_WEIGHTS}
                  frameCount={totalFrames}
                  showRadar={false}
                  showDonut={true}
                  isActive={true}
                  activeTensor={selectedSlice as "COG" | "EMO" | "ENV" | null}
                />
                {/* Breakdown */}
                <div className="flex items-center justify-center gap-6 mt-3">
                  {(["COG", "EMO", "ENV"] as const).map((t) => {
                    const total = DEMO_WEIGHTS.COG + DEMO_WEIGHTS.EMO + DEMO_WEIGHTS.ENV
                    const pct = ((DEMO_WEIGHTS[t] / total) * 100).toFixed(1)
                    return (
                      <button
                        key={t}
                        onClick={() => setSelectedSlice(selectedSlice === t ? null : t)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                          selectedSlice === t ? "bg-orange-500/20 ring-1 ring-orange-500/40" : "hover:bg-orange-500/10"
                        }`}
                      >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TENSOR_COLORS[t] }} />
                        <span className="text-xs font-mono font-bold" style={{ color: TENSOR_COLORS[t] }}>{pct}%</span>
                        <span className="text-[10px] text-orange-400/60 font-mono">{t}</span>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gaze Verification Status */}
          <Card className="border-orange-500/30 bg-gradient-to-br from-green-500/5 to-orange-500/5 backdrop-blur">
            <CardContent className="p-3 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-mono text-green-400 font-semibold">Gaze-Lock Verification</p>
                <p className="text-xs text-orange-400/60 font-mono">AGT biometric signature ready for CSTB attestation. Tailscale mesh secured.</p>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Verified
              </Badge>
            </CardContent>
          </Card>

          {/* Tensor Trends */}
          <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-yellow-500/5 backdrop-blur shadow-lg shadow-orange-500/5">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-sm text-orange-300 font-semibold">Tensor Trends (30s Sample)</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1">
              <AGTLineCharts
                cogHistory={cogHistory}
                emoHistory={emoHistory}
                envHistory={envHistory}
              />
            </CardContent>
          </Card>

          {/* Session History */}
          <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-yellow-500/5 backdrop-blur shadow-lg shadow-orange-500/5">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-sm text-orange-300 font-semibold">Session History</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1 space-y-2">
              {DEMO_SESSIONS.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-black/20 border border-orange-500/10 hover:border-orange-500/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-orange-400">{session.id}</span>
                      <span className="text-[10px] text-orange-400/40">{session.date}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-orange-400/60 font-mono">{session.duration}</span>
                      <span className="text-[10px] text-orange-400/40">|</span>
                      <span className="text-[10px] text-orange-400/60 font-mono">{session.frames} frames</span>
                    </div>
                  </div>

                  {/* AGT Distribution Bar */}
                  <div className="w-32 h-3 rounded-full overflow-hidden flex bg-black/30">
                    <div style={{ width: `${session.cog}%`, backgroundColor: TENSOR_COLORS.COG }} className="h-full" />
                    <div style={{ width: `${session.emo}%`, backgroundColor: TENSOR_COLORS.EMO }} className="h-full" />
                    <div style={{ width: `${session.env}%`, backgroundColor: TENSOR_COLORS.ENV }} className="h-full" />
                  </div>

                  {/* Reward */}
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-orange-300">+{session.optxReward} $OPTX</p>
                  </div>

                  {/* CSTB Status */}
                  <Badge className={`text-[10px] ${
                    session.cstbVerified
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                  }`}>
                    {session.cstbVerified ? "CSTB Verified" : "Pending"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
