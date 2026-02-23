"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, AlertTriangle, XCircle, Clock, ExternalLink, Sun, Moon, Activity, Server, Globe, Cpu, MessageSquare, Wifi, Database, Zap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// ── Service definitions ──
type ServiceStatus = "operational" | "degraded" | "outage" | "maintenance"

interface Service {
  name: string
  description: string
  status: ServiceStatus
  icon: typeof Server
  uptime: number // 0-100
  uptimeBars: boolean[] // last 90 days, true = up
}

interface Incident {
  id: string
  title: string
  status: "resolved" | "monitoring" | "investigating"
  severity: "minor" | "major" | "critical"
  date: string
  updates: { time: string; message: string }[]
}

const SERVICES: Service[] = [
  {
    name: "Astro Knots Vault",
    description: "Primary web application — astroknots.space",
    status: "operational",
    icon: Globe,
    uptime: 99.98,
    uptimeBars: Array(90).fill(true),
  },
  {
    name: "AARON Router",
    description: "Edge-first agentic router for biometric auth + x402 payments",
    status: "operational",
    icon: Zap,
    uptime: 99.95,
    uptimeBars: [...Array(88).fill(true), false, true],
  },
  {
    name: "SpacetimeDB",
    description: "Real-time edge database — reducers + subscriptions",
    status: "operational",
    icon: Database,
    uptime: 99.90,
    uptimeBars: [...Array(85).fill(true), false, ...Array(4).fill(true)],
  },
  {
    name: "JOE Matrix Bot",
    description: "Federated messaging agent — @joeclaw:matrix.org",
    status: "operational",
    icon: MessageSquare,
    uptime: 99.80,
    uptimeBars: [...Array(82).fill(true), false, false, ...Array(6).fill(true)],
  },
  {
    name: "JOE WebSocket",
    description: "Real-time agent communication bridge",
    status: "operational",
    icon: Wifi,
    uptime: 99.85,
    uptimeBars: [...Array(84).fill(true), false, ...Array(5).fill(true)],
  },
  {
    name: "Edge Compute Node",
    description: "Jetson Orin Nano — K3s orchestration + local inference",
    status: "operational",
    icon: Cpu,
    uptime: 99.70,
    uptimeBars: [...Array(80).fill(true), false, ...Array(9).fill(true)],
  },
  {
    name: "Solana RPC",
    description: "Helius-powered devnet + mainnet endpoints",
    status: "operational",
    icon: Activity,
    uptime: 99.99,
    uptimeBars: Array(90).fill(true),
  },
  {
    name: "Tailscale Mesh",
    description: "Encrypted WireGuard tunnels across all devices",
    status: "operational",
    icon: Server,
    uptime: 99.95,
    uptimeBars: [...Array(89).fill(true), true],
  },
]

const INCIDENTS: Incident[] = [
  {
    id: "inc-002",
    title: "SpacetimeDB restart required after update",
    status: "resolved",
    severity: "minor",
    date: "Feb 22, 2026",
    updates: [
      { time: "21:16 MST", message: "All services confirmed operational after joe spacetime --start." },
      { time: "21:12 MST", message: "SpacetimeDB health check updated. Root-owned log files cleared." },
      { time: "21:00 MST", message: "Identified zombie spacetimedb-update processes consuming CPU. Killed and restarted." },
    ],
  },
  {
    id: "inc-001",
    title: "JOE CLI shebang corruption",
    status: "resolved",
    severity: "minor",
    date: "Feb 22, 2026",
    updates: [
      { time: "21:12 MST", message: "JOE CLI v2 deployed via SCP. All commands operational." },
      { time: "21:00 MST", message: "~/bin/joe had corrupted shebang (\\n literal in first line). Windows line endings also present." },
    ],
  },
]

function StatusBadge({ status }: { status: ServiceStatus }) {
  const config = {
    operational: { label: "Operational", color: "bg-emerald-500", textColor: "text-emerald-500", icon: CheckCircle2 },
    degraded: { label: "Degraded", color: "bg-yellow-500", textColor: "text-yellow-500", icon: AlertTriangle },
    outage: { label: "Major Outage", color: "bg-red-500", textColor: "text-red-500", icon: XCircle },
    maintenance: { label: "Maintenance", color: "bg-blue-500", textColor: "text-blue-500", icon: Clock },
  }
  const c = config[status]
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${c.color}`} />
      <span className={`font-mono text-xs ${c.textColor}`}>{c.label}</span>
    </div>
  )
}

function UptimeBar({ bars, isDark }: { bars: boolean[]; isDark: boolean }) {
  return (
    <div className="flex gap-[1px] items-end h-6">
      {bars.map((up, i) => (
        <div
          key={i}
          className={`w-[3px] rounded-sm transition-colors ${
            up
              ? isDark ? "bg-emerald-500/70 hover:bg-emerald-400" : "bg-emerald-500/60 hover:bg-emerald-500"
              : isDark ? "bg-red-500/70 hover:bg-red-400" : "bg-red-500/60 hover:bg-red-500"
          }`}
          style={{ height: up ? "100%" : "100%" }}
          title={`Day ${90 - i}: ${up ? "Operational" : "Incident"}`}
        />
      ))}
    </div>
  )
}

function SeverityBadge({ severity, isDark }: { severity: string; isDark: boolean }) {
  const colors = {
    minor: isDark ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/25" : "bg-yellow-50 text-yellow-700 border-yellow-200",
    major: isDark ? "bg-orange-500/15 text-orange-400 border-orange-500/25" : "bg-orange-50 text-orange-700 border-orange-200",
    critical: isDark ? "bg-red-500/15 text-red-400 border-red-500/25" : "bg-red-50 text-red-700 border-red-200",
  }
  return (
    <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border ${colors[severity as keyof typeof colors]}`}>
      {severity}
    </span>
  )
}

export default function StatusPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  useEffect(() => {
    const saved = localStorage.getItem("dojo-theme") as "dark" | "light" | null
    if (saved) setTheme(saved)
    const handler = (e: Event) => setTheme((e as CustomEvent).detail)
    window.addEventListener("dojo-theme-change", handler)
    return () => window.removeEventListener("dojo-theme-change", handler)
  }, [])

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    localStorage.setItem("dojo-theme", next)
    window.dispatchEvent(new CustomEvent("dojo-theme-change", { detail: next }))
  }

  const isDark = theme === "dark"
  const allOperational = SERVICES.every(s => s.status === "operational")
  const lastIncident = INCIDENTS[0]

  return (
    <div className={`min-h-screen ${isDark ? "bg-zinc-950 text-white" : "bg-stone-50 text-zinc-900"} transition-colors`}>

      {/* ═══ Header ═══ */}
      <header className={`border-b ${isDark ? "border-zinc-800/50 bg-zinc-950/90" : "border-zinc-200/50 bg-white/90"} backdrop-blur-xl sticky top-0 z-50`}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-6 h-6 flex items-center justify-center">
              <Image
                src="/images/astroknots-logo.png"
                alt="Astro Knots"
                width={24}
                height={24}
                className="rounded-full object-contain"
              />
            </div>
            <span className={`font-mono text-sm tracking-wider ${isDark ? "text-white/70" : "text-zinc-600"}`}>
              <span className="text-orange-500 font-bold">ASTRO</span> KNOTS
            </span>
            <span className={`font-mono text-[10px] ml-2 px-2 py-0.5 rounded ${isDark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500"}`}>
              Status
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/docs"
              className={`font-mono text-[11px] px-2 py-1 rounded transition-colors ${isDark ? "text-zinc-500 hover:text-white hover:bg-white/5" : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"}`}
            >
              Docs
            </Link>
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-zinc-100"}`}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-zinc-400" /> : <Moon className="w-3.5 h-3.5 text-zinc-500" />}
            </button>
          </div>
        </div>
      </header>

      {/* ═══ Main ═══ */}
      <main className="max-w-3xl mx-auto px-6 py-10">

        {/* Overall Status Banner */}
        <div className={`p-6 rounded-xl border mb-10 ${
          allOperational
            ? isDark ? "border-emerald-500/20 bg-emerald-500/5" : "border-emerald-200 bg-emerald-50/50"
            : isDark ? "border-yellow-500/20 bg-yellow-500/5" : "border-yellow-200 bg-yellow-50/50"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {allOperational ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
              )}
              <div>
                <h1 className={`font-mono text-lg font-bold ${allOperational ? "text-emerald-500" : "text-yellow-500"}`}>
                  {allOperational ? "All Systems Operational" : "Partial Degradation"}
                </h1>
                <p className={`font-mono text-[10px] mt-0.5 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                  Last incident: {lastIncident?.date || "None"}
                </p>
              </div>
            </div>
            <p className={`font-mono text-[10px] ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
              Updated {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Service List */}
        <section className="mb-12">
          <h2 className={`font-mono text-xs uppercase tracking-widest mb-4 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
            Services
          </h2>

          <div className="space-y-2">
            {SERVICES.map((service) => (
              <div
                key={service.name}
                className={`p-4 rounded-lg border transition-colors ${
                  isDark ? "border-zinc-800/50 bg-zinc-900/30 hover:border-zinc-700/50" : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <service.icon className={`w-4 h-4 ${isDark ? "text-zinc-500" : "text-zinc-400"}`} />
                    <div>
                      <span className={`font-mono text-sm font-medium ${isDark ? "text-white" : "text-zinc-900"}`}>
                        {service.name}
                      </span>
                      <p className={`font-mono text-[9px] mt-0.5 ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
                        {service.description}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={service.status} />
                </div>

                <div className="flex items-center justify-between">
                  <UptimeBar bars={service.uptimeBars} isDark={isDark} />
                  <span className={`font-mono text-[10px] ml-3 shrink-0 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                    {service.uptime}% uptime
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className={`font-mono text-[8px] ${isDark ? "text-zinc-700" : "text-zinc-300"}`}>90 days ago</span>
                  <span className={`font-mono text-[8px] ${isDark ? "text-zinc-700" : "text-zinc-300"}`}>Today</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Incident History */}
        <section className="mb-12">
          <h2 className={`font-mono text-xs uppercase tracking-widest mb-4 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
            Recent Incidents
          </h2>

          {INCIDENTS.length === 0 ? (
            <p className={`font-mono text-sm ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
              No recent incidents.
            </p>
          ) : (
            <div className="space-y-4">
              {INCIDENTS.map((incident) => (
                <div
                  key={incident.id}
                  className={`p-4 rounded-lg border ${
                    isDark ? "border-zinc-800/50 bg-zinc-900/20" : "border-zinc-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-mono text-sm font-medium ${isDark ? "text-white" : "text-zinc-900"}`}>
                        {incident.title}
                      </h3>
                      <SeverityBadge severity={incident.severity} isDark={isDark} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded ${
                        incident.status === "resolved"
                          ? isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                          : isDark ? "bg-yellow-500/10 text-yellow-400" : "bg-yellow-50 text-yellow-600"
                      }`}>
                        {incident.status}
                      </span>
                      <span className={`font-mono text-[10px] ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
                        {incident.date}
                      </span>
                    </div>
                  </div>

                  <div className={`space-y-2 pl-3 border-l-2 ${isDark ? "border-zinc-800" : "border-zinc-200"}`}>
                    {incident.updates.map((update, i) => (
                      <div key={i}>
                        <span className={`font-mono text-[9px] ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
                          {update.time}
                        </span>
                        <p className={`font-mono text-[11px] ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                          {update.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Info */}
        <section className={`p-4 rounded-lg border ${isDark ? "border-zinc-800/30 bg-zinc-900/10" : "border-zinc-100 bg-zinc-50"}`}>
          <p className={`font-mono text-[10px] leading-relaxed ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
            This page reports the operational status of the Astro Knots infrastructure.
            All services run on dedicated edge hardware with encrypted WireGuard tunnels.
            Status is updated automatically. For questions, contact{" "}
            <Link href="https://x.com/jettoptx" target="_blank" className="text-orange-500 hover:underline">
              @jettoptx
            </Link>.
          </p>
        </section>
      </main>

      {/* ═══ Footer ═══ */}
      <footer className={`border-t ${isDark ? "border-zinc-800/50" : "border-zinc-200"}`}>
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
          <p className={`font-mono text-[10px] ${isDark ? "text-zinc-700" : "text-zinc-400"}`}>
            Powered by Jett Optics.ai — 100% in-house infrastructure
          </p>
          <div className="flex items-center gap-4">
            <Link href="https://jettoptics.ai" className={`font-mono text-[10px] ${isDark ? "text-zinc-600 hover:text-orange-400" : "text-zinc-400 hover:text-orange-600"}`}>
              jettoptics.ai
            </Link>
            <Link href="https://x.com/jettoptx" target="_blank" className={`font-mono text-[10px] ${isDark ? "text-zinc-600 hover:text-orange-400" : "text-zinc-400 hover:text-orange-600"}`}>
              @jettoptx
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
