import { NextResponse } from "next/server"

// ─── OPTX Agentic OS v5.0 — Endpoint Config ────────────────
// AstroJOE Brain: Docker container on CorsairOne via Tailscale
const ASTROJOE_BRAIN_URL = process.env.HEDGEHOG_URL || "http://100.105.218.115:5555"
// Conduit Matrix homeserver: Jetson via Tailscale Funnel
const MATRIX_HOMESERVER = process.env.MATRIX_HOMESERVER || "https://jettoptx-joe.taile11759.ts.net/conduit"
const MATRIX_ACCESS_TOKEN = process.env.MATRIX_ACCESS_TOKEN || ""
const MATRIX_ROOM_ID = process.env.MATRIX_ROOM_ID || "!ex1nY7tFxIMTZxZ6Xh3GREOfCYGgUq3a18-rMBSe8ZQ"

// Tailscale IPs
const JETSON_IP = "100.85.183.16"
const CORSAIR_IP = "100.105.218.115"

async function ping(url: string, timeoutMs = 5000): Promise<{ ok: boolean; ms: number; data?: unknown }> {
  const start = Date.now()
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), cache: "no-store" })
    const ms = Date.now() - start
    if (res.ok) {
      try { return { ok: true, ms, data: await res.json() } } catch { return { ok: true, ms } }
    }
    return { ok: false, ms }
  } catch { return { ok: false, ms: Date.now() - start } }
}

export async function GET() {
  // Parallel health checks across the entire mesh
  const [conduitPing, brainPing, brainStatePing, roomCheck] = await Promise.all([
    ping(`${MATRIX_HOMESERVER}/_matrix/client/versions`),
    ping(`${ASTROJOE_BRAIN_URL}/health`).then(async (r) => r.ok ? r : ping(ASTROJOE_BRAIN_URL)),
    ping(`${ASTROJOE_BRAIN_URL}/brain`),
    (async () => {
      if (!MATRIX_ACCESS_TOKEN) return false
      try {
        const res = await fetch(`${MATRIX_HOMESERVER}/_matrix/client/v3/joined_rooms`, {
          headers: { Authorization: `Bearer ${MATRIX_ACCESS_TOKEN}` },
          signal: AbortSignal.timeout(5000), cache: "no-store",
        })
        if (!res.ok) return false
        const data = await res.json()
        return (data.joined_rooms ?? []).includes(MATRIX_ROOM_ID)
      } catch { return false }
    })(),
  ])

  const conduitOnline = conduitPing.ok
  const brainOnline = brainPing.ok
  const roomJoined = roomCheck as boolean

  // Extract brain state from /brain endpoint
  const brainState = brainStatePing.ok && brainStatePing.data ? brainStatePing.data as Record<string, unknown> : null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const brainHealth = brainPing.ok && brainPing.data ? brainPing.data as Record<string, any> : null

  // Extract subsystem health from the /health endpoint
  const subsystems = brainHealth?.subsystems ?? {}
  const spacetimedbOnline = subsystems?.spacetimedb?.online ?? false
  const wolframOnline = subsystems?.wolfram_mcp?.online ?? false
  const gaussOnline = subsystems?.opengauss?.online ?? false

  let conduitVersion = "unknown"
  if (conduitPing.data && typeof conduitPing.data === "object") {
    const v = (conduitPing.data as { versions?: string[] }).versions
    if (v?.length) conduitVersion = v[v.length - 1]
  }

  // Extract engine details from brain state
  const engines = brainState ? (brainState as Record<string, unknown>).engines as Record<string, unknown> : null

  return NextResponse.json({
    online: true,

    // JOE Orchestrator (this API + Matrix bot on Jetson)
    orchestrator: {
      online: conduitOnline,
      host: "jettoptx-joe",
      ip: JETSON_IP,
      type: "Jetson Orin Nano",
      role: "JOE Orchestrator",
    },

    // AstroJOE Brain (Docker on CorsairOne)
    brain: {
      online: brainOnline,
      latencyMs: brainPing.ms,
      url: ASTROJOE_BRAIN_URL,
      host: "corsairone",
      ip: CORSAIR_IP,
      port: 5555,
      type: "CorsairOne (WSL2)",
      role: "AstroJOE Brain",
      runtime: "Docker (-p 5555:5555)",
      version: brainHealth?.version ?? "5.0.0",
    },

    // Conduit Matrix homeserver
    conduit: {
      online: conduitOnline,
      latencyMs: conduitPing.ms,
      homeserver: MATRIX_HOMESERVER,
      serverName: "jettoptx-joe",
      version: conduitVersion,
      botUser: "@joe:jettoptx-joe",
      webUser: "@web:jettoptx-joe",
      roomId: MATRIX_ROOM_ID,
      roomAccessible: roomJoined,
      tokenConfigured: !!MATRIX_ACCESS_TOKEN,
    },

    // SpacetimeDB Brain State
    spacetimedb: brainState
      ? {
        ...(brainState as Record<string, unknown>).spacetimedb ?? {},
        online: spacetimedbOnline,
        latencyMs: subsystems?.spacetimedb?.latency_ms ?? null,
      }
      : { tables: 52, reducers: 22, runtime: "WASM", status: "unreachable", online: false },

    // NEW: OpenGauss Engine
    opengauss: {
      online: gaussOnline,
      latencyMs: subsystems?.opengauss?.latency_ms ?? null,
      type: "OpenGauss (Lean4 Workflow Orchestrator)",
      capabilities: engines?.opengauss
        ? (engines.opengauss as Record<string, unknown>).capabilities
        : ["prove", "draft", "autoprove", "formalize", "autoformalize"],
    },

    // NEW: Wolfram MCP
    wolfram: {
      online: wolframOnline,
      latencyMs: subsystems?.wolfram_mcp?.latency_ms ?? null,
      type: "Wolfram Alpha (SecretiveShell MCP)",
      capabilities: engines?.wolfram_mcp
        ? (engines.wolfram_mcp as Record<string, unknown>).capabilities
        : ["math", "science", "data", "units", "chemistry", "physics"],
    },

    // AGT Tensor State
    agt: brainHealth?.agt ?? (brainState ? (brainState as Record<string, unknown>).agt : null),

    // Memory state
    memory: brainState ? (brainState as Record<string, unknown>).memory : null,

    // Compute history
    compute: brainState ? (brainState as Record<string, unknown>).compute : null,

    // Skills
    skills: brainState ? (brainState as Record<string, unknown>).skills : null,

    // Tailscale mesh nodes
    mesh: {
      protocol: "Tailscale Funnel",
      version: "v5.0",
      nodes: [
        { name: "jettoptx-joe", role: "JOE Orchestrator", ip: JETSON_IP, type: "Jetson Orin Nano", online: conduitOnline },
        { name: "corsairone", role: "AstroJOE Brain", ip: CORSAIR_IP, type: "CorsairOne (WSL2)", online: brainOnline },
        { name: "astrojoe-corsairone", role: "AstroJOE Sandbox", ip: CORSAIR_IP, type: "NemoClaw/OpenShell", online: brainOnline },
      ],
    },

    model: "grok-4.20-multi-agent-0309",
    harness: "NemoClaw + OpenShell",

    services: [
      { name: "JOE Orchestrator", port: 6167, host: "jettoptx-joe", status: conduitOnline ? "online" : "unreachable", latencyMs: conduitPing.ms },
      { name: "AstroJOE Brain", port: 5555, host: "corsairone", status: brainOnline ? "online" : "unreachable", latencyMs: brainPing.ms },
      { name: "SpacetimeDB Brain", port: 3000, host: "corsairone", status: spacetimedbOnline ? "online" : brainOnline ? "pending" : "unreachable" },
      { name: "OpenGauss Engine", port: null, host: "corsairone", status: gaussOnline ? "online" : brainOnline ? "pending" : "unreachable" },
      { name: "Wolfram MCP", port: 8787, host: "corsairone", status: wolframOnline ? "online" : brainOnline ? "pending" : "unreachable" },
      { name: "AstroJOE Sandbox", port: null, host: "corsairone", status: brainOnline ? "ready" : "unknown" },
      { name: "OPTX Command Room", port: null, host: "conduit", status: roomJoined ? "joined" : "not accessible" },
      { name: "AARON Auditor", port: 8888, host: "jettoptx-joe", status: conduitOnline ? "online" : "unknown" },
    ],
  })
}
